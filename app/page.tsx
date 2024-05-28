import { ExternalLink } from '@/components/external-link';
import { getFocusmateOAuthURL } from '@/utils/getOAuthURL';

const oauthUrl = getFocusmateOAuthURL();

export default function Home() {

  return (
    <ExternalLink href={oauthUrl}>
      <button type='button'>
        <p>Login with Focusmate</p>
      </button>
    </ExternalLink>
  );
}
