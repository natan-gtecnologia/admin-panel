import { Spinner } from 'reactstrap';

import 'react-toastify/dist/ReactToastify.css';

export type LoaderProps = {
  loading: {
    title: string;
    description: string;
  } | null;
};

const Loader = ({ loading }: LoaderProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',

        zIndex: 9999,
      }}
    >
      <div className="d-flex justify-content-center mx-2 mt-2">
        <Spinner color="primary"> Loading... </Spinner>
      </div>
    </div>
  );
};

export default Loader;
