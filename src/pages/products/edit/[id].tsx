import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import qs from 'qs';

import { NextPageWithLayout } from '../../../@types/next';
import { IProduct } from '../../../@types/product';
import CreateOrEditProduct from '../../../components/Products/CreateOrEditProduct';
import Layout from '../../../containers/Layout';
import { setupAPIClient } from '../../../services/api';
import { api } from '../../../services/apiClient';
import { convert_product_strapi } from '../../../utils/convertions/convert_product';
import { currencyMask } from '../../../utils/masks';
import { withSSRAuth } from '../../../utils/withSSRAuth';

type EditProps = {
  product: IProduct;
};

const Edit: NextPageWithLayout<EditProps> = ({ product: initialData }) => {
  const { data: product } = useQuery(
    ['product', initialData.id],
    async () => {
      const product = await api.get(`/products/auth/${initialData.id}`, {
        params: {
          populate: '*',
        },
        paramsSerializer: (params) => {
          return qs.stringify(params);
        },
      });

      return convert_product_strapi(product.data.data);
    },
    {
      initialData,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div className="page-content">
      <Head>
        <title>
          {product.title} | SKU {product.sku} | Edição de produto - GrowForce
        </title>
      </Head>
      <BreadCrumb title="Edição de produto" pageTitle="Ecommerce" />
      <CreateOrEditProduct
        key={product.updatedAt}
        product={{
          ...product,
          categories:
            product.categories?.data?.map((category) => category.id) || [],
          //variations: product.variations?.data?.map((variation) => variation.id) || [],
          images: product.images?.data?.map((image) => image.id) || [],
          tags: product.tags?.data?.map((tag) => tag.id) || [],
          brand: product.brand?.data?.id || null,
          distribution_centers:
            product.distribution_centers?.data?.map((d) => d.id) || [],
          groupedProducts:
            product.groupedProducts
              ?.filter((groupedProduct) => groupedProduct.product.data)
              .map((groupedProduct) => ({
                product: groupedProduct.product?.data?.id,
                quantity: groupedProduct.quantity,
              })) || [],
          featured: product.featured || false,
          relationed_products:
            product.relationed_products?.data?.map((p) => p.id) || [],
          variations: [],
          product_image_id:
            product.images?.data?.length > 0
              ? product.images?.data[0].id
              : null,
          dimension: {
            height: currencyMask.maskDefault(product.dimension?.height || 0),
            width: currencyMask.maskDefault(product.dimension?.width || 0),
            length: currencyMask.maskDefault(product.dimension?.length || 0),
            weight: currencyMask.maskDefault(product.dimension?.weight || 0),
          },
          price: {
            regularPrice: currencyMask.maskDefault(
              product.price?.regularPrice || 0,
            ),
            salePrice: currencyMask.maskDefault(product.price?.salePrice || 0),
          },
        }}
        images={product.images?.data || []}
      />
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const api = setupAPIClient(ctx);
    const { id } = ctx.params;

    if (!id) throw new Error('Product id not found');

    const product = await api.get(`/products/auth/${id}`, {
      params: {
        populate: '*',
      },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      },
    });

    if (!product.data.data) throw new Error('Product not found');

    return {
      props: {
        product: convert_product_strapi(product.data.data),
      },
    };
  } catch (err) {
    console.log(err);
    return {
      redirect: {
        destination: '/products',
        permanent: false,
      },
    };
  }
});

export default Edit;

Edit.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
