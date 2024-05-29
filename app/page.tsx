import { ExternalLink } from '@/components/external-link';
import { fmOAuthForAuthCodeUrl } from '@/utils/oauth';

export default function Home() {

  return (
    <ExternalLink href={fmOAuthForAuthCodeUrl}>
      <button type='button'>
        <p>Login with Focusmate</p>
      </button>
    </ExternalLink>
  );
}
