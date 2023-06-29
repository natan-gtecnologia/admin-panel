import { NextPageWithLayout } from '../@types/next';
import Layout from '../containers/Layout';

const Home: NextPageWithLayout = () => {
  return <div className="page-content">Bem-vindo ao painel administrativo!</div>;
};

export default Home;


Home.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
