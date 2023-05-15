export type MetaData = {
  id: number;
  key: string;
  valueString?: string;
  valueInteger?: number;
  valueBigInteger?: number;
  valueDecimal?: number;
  valueFloat?: number;
  valueBoolean?: boolean;
  valueJson?: unknown;
};

export interface IStrapiImage {
  id: number;
  attributes: {
    size: number;
    formats: {
      thumbnail: {
        url: string;
        hash: string;
        name: string;
        ext: string;
      };
      small: {
        url: string;
        hash: string;
        name: string;
        ext: string;
      };
    };
    ext: string;
    hash: string;
    name: string;
    alternativeText: string;
    caption: string;
    width: number;
    height: number;
    url: string;
  };
}

export interface IStrapiProduct {
  id: number;
  attributes: {
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    type: "simple" | "grouped" | "kit";
    status: "available" | "not_available";
    productType: "physical" | "digital";
    featured: boolean;
    sku: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    currency: {
      id: number;
      code: string;
      symbol: string;
      decimals: number;
    };
    price: {
      id: number;
      regularPrice: number;
      salePrice: number;
      offPrice: number;
    };
    dimension: {
      id: number;
      width: number;
      height: number;
      weight: number;
      length: number;
    };
    images: {
      data: IStrapiImage[];
    };
    categories: {
      data: {
        id: number;
        attributes: {
          title: string;
          description: string;
        };
      }[];
    };
    tags: {
      data: {
        id: number;
        attributes: {
          tag: string;
          color: string;
        };
      }[];
    };
    groupType: "simple" | "grouped" | "kit";
    metaData?: MetaData[];
    features: {
      id: number;
      label: string;
      value: string;
    }[];
    brand: {
      data?: {
        id: number;
        attributes: {
          name: string;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
    company?: {
      data?: {
        attributes: {
          name: string;
        };
      };
    };
    distribution_centers?: {
      data?: {
        id: number;
        attributes: {
          name: string;
        };
      }[];
    };
    stockStatus: "in_stock" | "out_of_stock" | "on_back_order";
    stockQuantity: number;
    totalSales: number;

    groupedProducts: {
      quantity: number;
      product: {
        data: IStrapiProduct;
      };
    }[];
    relationed_products: {
      data: IStrapiProduct[];
    };
  };
}
export interface IStrapiCategory {
  id: number;
  attributes: {
    title: string;
    description: string;
    slug: string;
    createdAt: string;
    metaData: MetaData[];
    updatedAt: string;
    publishedAt: string;
  };
}
export interface IStrapiBrand {
  id: number;
  attributes: {
    name: string;
    createdAt: string;
  };
}
export interface IStrapiBanner {
  id: number;
  attributes: {
    title: string;
    page_link: string;
    page: "product" | "homepage" | "products";
    order: number;
    type: "hero" | "section";
    link_type: "product" | "page" | "category";
    desktop_image: {
      data: IStrapiImage;
    };
    mobile_image: {
      data: IStrapiImage;
    };
    category_link: {
      data: IStrapiCategory;
    };
    product_link: {
      data: IStrapiProduct;
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

export interface IStrapiCoupon {
  id: number;
  attributes: {
    code: string;
    description: string;
    discount: number;
    enabled: boolean;
    automatic: boolean;
    accumulative: boolean;
    firstShop: boolean;
    discountType: "price" | "percentage";
    type:
    | "all_store"
    | "specific_products"
    | "specific_categories"
    | "specific_customers"
    | "free_shipping_by_region"
    | "free_shipping_by_products"
    | "buy_and_earn_by_products"
    | "buy_and_earn_by_categories"
    | "buy_and_earn_by_cart_price";
    initialDate?: string;
    finalDate?: string;
    shippingType: "not_apply" | "to_shipping" | "free_shipping";
    shippingDiscountType: "price" | "percentage";
    maximumUseQuantity?: number;
    minimumPrice?: number;
    maximumPrice?: number;
    minimumProductQuantity?: number;
    initialCepRange?: string;
    finalCepRange?: string;
    minimumCartPrice?: number;
    accumulatedDiscountLimit?: number;
    shippingDiscount?: number;
    minimumCartAmount?: number;
    applicationType: "all_store" | "specific_products" | "specific_products";
    buyAndEarnProducts?: {
      buyProducts?: IStrapiCartProduct;
      earnProducts?: IStrapiCartProduct;
    }[];
    categories?: IStrapiCategory[];
    products?: IStrapiProduct[];
    customers?: {
      attributes?: {
        email?: string;
      };
    }[];
  };
}

export interface IStrapiCartProduct {
  id: number;
  quantity: number;
  product: {
    data: IStrapiProduct;
  };
  price: {
    regularPrice: number;
    salePrice: number;
    offPrice?: number;
  };
  metaData: MetaData[];
}

export interface IStrapiCart {
  id: number;
  attributes: {
    hash: string;
    totals: {
      subTotal: number;
      total: number;
      quantity?: number;
      fee?: number;
      discount?: number;
      shipping?: number;
      shippingDiscount?: number;
    };
    metaData: MetaData[];
    items: IStrapiCartProduct[];
    coupons: { data: any[] };
  };
  meta: {
    id: number;
    key: string;
    valueString?: string;
    valueInteger?: number;
    valueBigInteger?: number;
    valueDecimal?: number;
    valueFloat?: number;
    valueBoolean?: boolean;
    valueJson?: unknown;
  };
}

export interface IStrapiPriceList {
  id: number;

  attributes: {
    name: string;

    productPrices: {
      product: {
        data: {
          id: number;
          attributes: {
            title: string;
          };
        };
      };
      price: {
        regularPrice: number;
        salePrice: number;
      };
    }[];

    enabled: boolean;
    company: {
      data?: {
        id: number;
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface IStrapiCompany {
  id: number;
  attributes: {
    name?: string;
    cnpj?: string;
    phone?: string;
    email?: string;
    type?: "virtual" | "online" | "physical";
    nodeId?: string;
    address?: {
      address1: string;
      address2?: string;
      number: string;
      postCode: string;
      city: string;
      state: string;
      country: string;
    };

    company?: {
      data?: IStrapiCompany;
    };
    priceList?: {
      data?: IStrapiPriceList;
    };

    createdAt: string;
    updatedAt: string;
    metaData?: MetaData[];
  };
}

export interface IStrapiOrder {
  id: number;
  attributes: {
    createdAt: string;
    updatedAt: string;
    status:
    | "PENDING"
    | "PAID"
    | "SHIPPING"
    | "SHIPPING_LAST_STEP"
    | "COMPLETED"
    | "FAILED"
    | "CANCELED"
    | "REFUNDED";
    uuid: string;
    orderId: string;
    billingAddress: {
      id: number;
      address1: string;
      address2: string;
      number: string;
      postCode: string;
      city: string;
      state: string;
      country: string;
      neighborhood: string;
    };
    shippingAddress: {
      id: number;
      address1: string;
      address2: string;
      number: string;
      postCode: string;
      city: string;
      state: string;
      country: string;
      neighborhood: string;
    };
    items: [
      {
        id: number;
        quantity: number;
        gift: false;
        name: string;
        sku: string;
        product: {
          data: {
            id: number;
            attributes: {
              images?: {
                data: IStrapiImage[];
              };
              price?: {
                regularPrice: number;
                salePrice: number;
                offPrice?: number;
              };
            };
          };
        };
        price: {
          regularPrice: number;
          salePrice: number;
          offPrice?: number;
        };
        metaData: MetaData[];
      }
    ];
    totals: {
      id: number;
      quantity: number;
      subTotal: number;
      fee: number;
      discount: number;
      shipping: number;
      total: number;
      shippingDiscount: number;
    };
    customer: {
      data: {
        id: number;
        attributes: {
          email: string;
          document: string;
          documentType: string;
          createdAt: string;
          updatedAt: string;
          firstName: string;
          lastName: string;
          homePhone: {
            countryCode: string;
            areaCode: string;
            number: string;
          };
          mobilePhone: {
            countryCode: string;
            areaCode: string;
            number: string;
          };
        };
      };
    };
    metaData: MetaData[];
    payment: {
      id: number;
      method: "pix" | "credit_card" | "boleto";
      qrCode: string;
      code: string;
      installments: number;
    };
    coupons: {
      id: number;
      description: string;
      discount: number;
      type:
      | "all_store"
      | "specific_products"
      | "specific_categories"
      | "specific_customers"
      | "free_shipping_by_region"
      | "free_shipping_by_products"
      | "buy_and_earn_by_products"
      | "buy_and_earn_by_categories"
      | "buy_and_earn_by_cart_price";
      discountType: "price" | "percentage";
      shippingType: "not_apply" | "to_shipping" | "free_shipping";
      code: string;
    }[];
    shipping: {
      id: number;
      method: string;
      trackingCode: string;
      trackingEvents: {
        sk_event: string;
        uf?: string;
        tag: "added" | "collected" | "movement" | "onroute" | "delivered";
        city?: string;
        date: "2022-11-17T03:05:52.000Z";
        local?: string;
        events: string;
        comment?: string;
        latitude?: string;
        longitude?: string;
        signature?: string;
        created_at: string;
        postal_code?: string;
        tracking_id: number;
        delivered_at: string;
        destination_uf?: string;
        destination_city?: string;
        destination_local?: string;
      }[];
    };
  };
}

export interface IStrapiTag {
  id: number;
  attributes: {
    tag: string;
    color: string;
    createdAt: string;
    updatedAt: string;
    metaData: MetaData[];
  };
}
export interface IStrapiCustomer {
  id: number;
  attributes: {
    birthDate: string;
    email: string;
    document: string;
    documentType: "cpf" | "cnpj" | "passport";
    createdAt: string;
    updatedAt: string;
    firstName: string;
    lastName: string;
    homePhone: {
      countryCode: string;
      areaCode: string;
      number: string;
    };
    mobilePhone: {
      countryCode: string;
      areaCode: string;
      number: string;
    };
    address: {
      id: number;
      address1: string;
      address2: string;
      number: string;
      postCode: string;
      city: string;
      state: string;
      country: string;
      neighborhood: string;
    };
    orders: {
      data: {
        attributes: {
          createdAt: string;
          orderId: string;
          status: string;
          updatedAt: string;
          uuid: string;
        };
        id: number;
      }[];
    };
    carts: {
      data: {
        attributes: {
          createdAt: string;
          hash: string;
          shippingMethod: string;
          updatedAt: string;
        };
        id: number;
      }[];
    };
  };
}
export interface IStrapiDistributionCenter {
  id: number;
  attributes: {
    name: string;
    createdAt: string;
    updatedAt: string;
    cnpj: string;
    phone?: string;
    email?: string;
    responsible?: string;
  };
}

export type IStrapiFileResponse = IStrapiImage["attributes"] & {
  id: number;
};

// livestream
export interface IStrapiLiveStream {
  id: number;
  attributes: {
    state: "enabled" | "disabled" | "testing" | "finished";
    uuid: string;
    title: string;
    liveDescription: string;
    streamKey: string;
    liveEventName: string;
    transmissionUrl: string;
    endedDate: string | null;
    schedule: string;
    startedDate?: string;
    timeout?: number | null;
    startText: string;
    backgroundColorIfNotHaveBanner: string;
    broadcasters: {
      id: number;
      code: string;

      broadcaster: {
        data: {
          id: number;
          attributes: {
            name: string;
            avatar: {
              data: IStrapiImage;
            };
            email: string;
            socialMedias: {
              id: 1;
              facebook: string | null;
              twitter: string | null;
              instagram: string | null;
              whatsapp: string | null;
              telegram: string | null;
            };
          };
        };
      };
    }[];
    coupons: {
      data: IStrapiCoupon[];
    };
    streamProducts: {
      id: number;
      product: {
        data: IStrapiProduct;
      };
      price: {
        regularPrice: number;
        salePrice: number;
      };
      highlight: boolean;
    }[];
    metaData: MetaData[];
    chat: {
      data: {
        id: number;
        attributes: {
          active: boolean;
        };
      };
    };
    bannerLive: {
      data: IStrapiImage;
    };
  };
}
export interface IStrapiBroadcaster {
  id: number
  attributes: {
    name: string
    createdAt: string
    updatedAt: string
    email?: string
    avatar: {
      data: {
        id: number
        attributes: {
          name: string
          alternativeText: any
          caption: any
          width: number
          height: number
          formats?: {
            thumbnail: {
              name: string
              hash: string
              ext: string
              mime: string
              path: any
              width: number
              height: number
              size: number
              url: string
            }
          }
          hash: string
          ext: string
          mime: string
          size: number
          url: string
          previewUrl: any
          provider: string
          provider_metadata: any
          createdAt: string
          updatedAt: string
        }
      }
    }
    socialMedias?: {
      id: number
      facebook: any
      twitter: any
      instagram: any
      whatsapp: any
      telegram: any
      email: any
      telefone: any
    }
    metaData: any[]
  }
}
export interface IStrapiChat {
  id: number;
  attributes: {
    released: boolean;
    createdAt: string;
    updatedAt: string;
    messages: {
      data: {
        id: number;
        attributes: {
          message: string;
          datetime: string;
          createdAt: string;
          updatedAt: string;
          author: {
            data: {
              id: number;
              attributes: {
                firstName: string;
                lastName: string;
                email: string;
                socketId?: string;
                createdAt: string;
                updatedAt: string;
              };
            };
          };
          exclusion: any;
        };
      }[];
    };
    users: {
      id: number;
      joinedAt: string;
      blocked: boolean;
      blockedAt: any;
      isOnline: boolean;
      chat_user: {
        id: number;
        attributes: {
          firstName: string;
          lastName: string;
          email: string;
          socketId: string;
          createdAt: string;
          updatedAt: string;
        };
      };
    }[];
    //liveStream: {
    //  data: IStrapiLiveStream
    //}
  };
}
