import base64
import os
from dotenv import load_dotenv
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

load_dotenv()

# Configuration for AES encryption
algorithm = algorithms.AES
key_as_string = os.getenv("ENCRYPTION_KEY")
key_as_bytes = bytes.fromhex(key_as_string)
aes_iv = os.getenv("ENCRYPTION_AES_IV")
backend = default_backend()


def encrypt(text: str) -> str:
    iv = bytes.fromhex(aes_iv)

    cipher = Cipher(algorithm(key_as_bytes), modes.CBC(iv), backend=backend)
    encryptor = cipher.encryptor()

    padder = padding.PKCS7(algorithm.block_size).padder()
    padded_data = padder.update(text.encode('utf-8')) + padder.finalize()

    encrypted = encryptor.update(padded_data) + encryptor.finalize()

    return (f"{base64.b64encode(iv).decode('utf-8')}:"
            f"{base64.b64encode(encrypted).decode('utf-8')}")


def decrypt(encrypted_text: str) -> str:
    iv_text, encrypted = encrypted_text.split(":")
    iv = base64.b64decode(iv_text)
    encrypted_data = base64.b64decode(encrypted)

    cipher = Cipher(algorithm(key_as_bytes), modes.CBC(iv), backend=backend)
    decryptor = cipher.decryptor()

    decrypted_padded = decryptor.update(encrypted_data) + decryptor.finalize()

    unpadder = padding.PKCS7(algorithm.block_size).unpadder()
    decrypted = unpadder.update(decrypted_padded) + unpadder.finalize()

    return decrypted.decode('utf-8')
