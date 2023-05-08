import { NextPageWithLayout } from '../@types/next';
import Layout from '../containers/Layout';
import { withSSRAuth } from '../utils/withSSRAuth';

const Home: NextPageWithLayout = () => {
  return <div className="page-content">Bem-vindo ao painel administrativo!</div>;
};

export default Home;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});

Home.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
