"""AES-256-CBC round trips for the stored Focusmate access token.

Two implementations write this format -- `api_utils/encryption.py` here and
`lib/encryption.ts` in the Next app, which is what actually encrypts the token
at sign-in. They have to stay interchangeable, so one test pins a ciphertext
produced by the TypeScript side.
"""

import base64
import os

import pytest
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

from api_utils.config import ENCRYPTION_KEY_STR
from api_utils.encryption import decrypt, encrypt

TOKEN = "fm_access_token_abc123"


class TestRoundTrip:
    def test_decrypt_undoes_encrypt(self):
        assert decrypt(encrypt(TOKEN)) == TOKEN

    @pytest.mark.parametrize("text", [
        "",
        "a",
        "x" * 16,   # exactly one AES block, so padding adds a whole block
        "x" * 15,
        "x" * 17,
        "unicode: ✓ é 日本語",
        "token with spaces and : colons",
    ])
    def test_round_trips_awkward_lengths_and_characters(self, text):
        assert decrypt(encrypt(text)) == text

    def test_output_is_iv_and_ciphertext_joined_by_a_colon(self):
        iv_part, cipher_part = encrypt(TOKEN).split(":")
        assert len(base64.b64decode(iv_part)) == 16
        assert base64.b64decode(cipher_part)


class TestInitializationVector:
    def test_each_call_uses_a_fresh_iv(self):
        # A fixed IV makes CBC deterministic: identical tokens encrypt to
        # identical ciphertext, and shared prefixes stay visible
        assert encrypt(TOKEN) != encrypt(TOKEN)

    def test_the_same_plaintext_never_repeats_a_ciphertext(self):
        assert len({encrypt(TOKEN) for _ in range(20)}) == 20

    def test_a_token_written_under_the_old_fixed_iv_still_decrypts(self):
        # Tokens encrypted before the IV became random are still in the
        # database, and rotating them would sign those users out
        fixed_iv = bytes(range(16))
        key = bytes.fromhex(ENCRYPTION_KEY_STR)
        padder = padding.PKCS7(algorithms.AES.block_size).padder()
        padded = padder.update(TOKEN.encode()) + padder.finalize()
        encryptor = Cipher(
            algorithms.AES(key), modes.CBC(fixed_iv)).encryptor()
        body = encryptor.update(padded) + encryptor.finalize()

        legacy = (f"{base64.b64encode(fixed_iv).decode()}:"
                  f"{base64.b64encode(body).decode()}")

        assert decrypt(legacy) == TOKEN


class TestCorruptInput:
    def test_a_value_without_a_separator_is_rejected(self):
        with pytest.raises(ValueError):
            decrypt("no-colon-here")

    def test_a_tampered_ciphertext_does_not_return_the_token(self):
        # CBC is unauthenticated, so a flipped byte either fails to unpad or
        # decrypts to garbage. Either is fine; silently returning the real
        # token would not be.
        iv_part, cipher_part = encrypt(TOKEN).split(":")
        body = bytearray(base64.b64decode(cipher_part))
        body[0] ^= 0xFF
        tampered = f"{iv_part}:{base64.b64encode(bytes(body)).decode()}"

        try:
            assert decrypt(tampered) != TOKEN
        except Exception:
            pass  # unpadding or utf-8 decoding failed, which is also correct

    def test_a_wrong_length_iv_is_rejected(self):
        _, cipher_part = encrypt(TOKEN).split(":")
        short_iv = base64.b64encode(os.urandom(8)).decode()
        with pytest.raises(Exception):
            decrypt(f"{short_iv}:{cipher_part}")


class TestCrossLanguageCompatibility:
    def test_decrypts_a_ciphertext_produced_by_the_typescript_module(self):
        """`lib/encryption.ts` is what encrypts the token at sign-in; this
        module is what reads it back on every API request. This ciphertext was
        produced by that module under the test key in tests/conftest.py:

            node -e 'const {createCipheriv}=require("crypto"); ...'

        Regenerate it the same way if the format ever changes deliberately.
        """
        # iv:ciphertext, base64 each side, AES-256-CBC with PKCS7
        from_typescript = (
            "AAECAwQFBgcICQoLDA0ODw==:"
            "xuFESGp7GkHDWkSoCaTdBER1kuF5IcFhsh1McTXJR/o=")
        assert decrypt(from_typescript) == TOKEN
