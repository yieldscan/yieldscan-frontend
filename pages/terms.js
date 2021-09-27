import dynamic from 'next/dynamic';
import WithDocumentationLayout from '@components/common/layouts/documentation';

const Page = dynamic(
  () => import('@components/common/page').then(mod => mod.default),
  { ssr: false },
);

const TermsComponent = dynamic(
  () => import('@components/policies/terms-component').then(mod => mod.default),
  { ssr: false },
);

const Terms = () => (
  <Page title="Terms of service" layoutProvider={WithDocumentationLayout}>
    {() => <TermsComponent />}
  </Page>
);

export default Terms;