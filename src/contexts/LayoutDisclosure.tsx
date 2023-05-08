import Loader from "@/components/Common/Loader";
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  LayoutModeTypes,
  LayoutPositionTypes,
  LayoutTypes,
  LayoutWidthTypes,
  LeftsidbarSizeTypes,
  LeftSidebarImageTypes,
  LeftSidebarTypes,
  LeftSidebarViewTypes,
  PreloaderTypes,
  TopbarThemeTypes,
} from "../constants/layout";

export interface ChildItem {
  id: string | number;
  label: string;
  link: string;
  parentId: string;
  isChildItem?: boolean;
  permissions?: string[];
  childItems?: ChildItem[];
}

export interface SubItem extends ChildItem {
  badgeName?: string;
  badgeColor?: string;
}

export interface Permission {
  modules: string;
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface MenuItem {
  label: string;
  isHeader?: boolean;
  id?: string;
  icon?: string;
  link?: string;
  permissions?: Permission[];
  subItems?: SubItem[];
}

type LoadingProps = {
  title: string;
  description: string;
} | null;

export type LayoutDisclosureProps = {
  // values
  layoutModeType: LayoutModeTypes;
  layoutType: LayoutTypes;
  preloader: PreloaderTypes;
  layoutWidthType: LayoutWidthTypes;
  layoutPositionType: LayoutPositionTypes;
  topbarThemeType: TopbarThemeTypes;
  leftsidbarSizeType: LeftsidbarSizeTypes;
  leftSidebarViewType: LeftSidebarViewTypes;
  leftSidebarType: LeftSidebarTypes;
  leftSidebarImageType: LeftSidebarImageTypes;
  menuItems: MenuItem[];
  currentOpenMenuDropdown: string;

  // actions
  onChangeLayoutMode: (mode: LayoutModeTypes) => void;
  onChangeLayoutType: (type: LayoutTypes) => void;
  handleChangePreloader: (preloader: PreloaderTypes) => void;
  handleChangeLayoutWidthType: (layoutWidthType: LayoutWidthTypes) => void;
  handleChangeLayoutPositionType: (
    layoutPositionType: LayoutPositionTypes
  ) => void;
  handleChangeTopbarThemeType: (topbarThemeType: TopbarThemeTypes) => void;
  handleChangeLeftsidbarSizeType: (
    leftsidbarSizeType: LeftsidbarSizeTypes
  ) => void;
  handleChangeLeftSidebarViewType: (
    leftSidebarViewType: LeftSidebarViewTypes
  ) => void;
  handleChangeLeftSidebarType: (leftSidebarType: LeftSidebarTypes) => void;
  handleChangeLeftSidebarImageType: (
    leftSidebarImageType: LeftSidebarImageTypes
  ) => void;
  handleChangeMenuItems: (menuItems: MenuItem[]) => void;
  handleChangeCurrentOpenMenuDropdown: (
    currentOpenMenuDropdown: string
  ) => void;

  handleChangeLoading: (loading: LoadingProps) => void;
};

export type LayoutDisclosureProviderProps = {
  children: ReactNode;
  initialMenuItems?: MenuItem[];
};

export const LayoutDisclosure = createContext({} as LayoutDisclosureProps);

export function LayoutDisclosureProvider({
  children,
  initialMenuItems = [],
}: LayoutDisclosureProviderProps) {
  const [layoutModeType, setLayoutModeType] =
    useState<LayoutModeTypes>("light");
  const [layoutType, setLayoutType] = useState<LayoutTypes>("vertical");
  const [preloader, setPreloader] = useState<PreloaderTypes>("disable");
  const [layoutWidthType, setLayoutWidthType] =
    useState<LayoutWidthTypes>("lg");
  const [layoutPositionType, setLayoutPositionType] =
    useState<LayoutPositionTypes>("fixed");
  const [topbarThemeType, setTopbarThemeType] =
    useState<TopbarThemeTypes>("light");
  const [leftsidbarSizeType, setLeftsidbarSizeType] =
    useState<LeftsidbarSizeTypes>("lg");
  const [leftSidebarViewType, setLeftSidebarViewType] =
    useState<LeftSidebarViewTypes>("default");
  const [leftSidebarType, setLeftSidebarType] =
    useState<LeftSidebarTypes>("dark");
  const [leftSidebarImageType, setLeftSidebarImageType] =
    useState<LeftSidebarImageTypes>("none");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [currentOpenMenuDropdown, setCurrentOpenMenuDropdown] = useState("");
  const [loading, setLoading] = useState<LoadingProps>(null);

  const handleChangeLoading = useCallback((loading: LoadingProps) => {
    setLoading(loading);
  }, []);

  function changeHTMLAttribute(attribute: string, value: string) {
    if (typeof document !== "undefined") {
      document?.documentElement.setAttribute(attribute, value);
    }
  }

  /* A function that is called when the layout type is changed. */
  const onChangeLayoutType = useCallback((type: LayoutTypes) => {
    setLayoutType(type);
    try {
      if (type === "twocolumn") {
        document?.documentElement.removeAttribute("data-layout-width");
      } else if (type === "horizontal") {
        document?.documentElement.removeAttribute("data-sidebar-size");
      }
      changeHTMLAttribute("data-layout", type);
    } catch (error) {
      // console.log(error);
    }
  }, []);

  /* A function that is called when the preloader is changed. */
  const handleChangePreloader = useCallback((preloader: PreloaderTypes) => {
    setPreloader(preloader);
    changeHTMLAttribute("data-preloader", preloader);
  }, []);

  /* A function that is called when the layout width type is changed. */
  const handleChangeLayoutWidthType = useCallback(
    (layoutWidthType: LayoutWidthTypes) => {
      const type = layoutWidthType === "lg" ? "fluid" : "boxed";
      setLayoutWidthType(layoutWidthType);
      changeHTMLAttribute("data-layout-width", type);
    },
    []
  );

  /* A function that is called when the layout position type is changed. */
  const handleChangeLayoutPositionType = useCallback(
    (layoutPositionType: LayoutPositionTypes) => {
      setLayoutPositionType(layoutPositionType);
      changeHTMLAttribute("data-layout-position", layoutPositionType);
    },
    []
  );

  /* A function that is called when the topbar theme type is changed. */
  const handleChangeTopbarThemeType = useCallback(
    (topbarThemeType: TopbarThemeTypes) => {
      setTopbarThemeType(topbarThemeType);
      changeHTMLAttribute("data-topbar", topbarThemeType);
    },
    []
  );

  /* A function that is called when the left sidebar size type is changed. */
  const handleChangeLeftsidbarSizeType = useCallback(
    (leftsidbarSizeType: LeftsidbarSizeTypes) => {
      setLeftsidbarSizeType(leftsidbarSizeType);
      changeHTMLAttribute("data-sidebar-size", leftsidbarSizeType);
    },
    []
  );

  /* A function that is called when the left sidebar view type is changed. */
  const handleChangeLeftSidebarViewType = useCallback(
    (leftSidebarViewType: LeftSidebarViewTypes) => {
      setLeftSidebarViewType(leftSidebarViewType);
      changeHTMLAttribute("data-layout-style", leftSidebarViewType);
    },
    []
  );

  /* A function that is called when the left sidebar type is changed. */
  const handleChangeLeftSidebarType = useCallback(
    (leftSidebarType: LeftSidebarTypes) => {
      setLeftSidebarType(leftSidebarType);
      changeHTMLAttribute("data-sidebar", leftSidebarType);
    },
    []
  );

  /* A function that is called when the left sidebar image type is changed. */
  const handleChangeLeftSidebarImageType = useCallback(
    (leftSidebarImageType: LeftSidebarImageTypes) => {
      setLeftSidebarImageType(leftSidebarImageType);
      changeHTMLAttribute("data-sidebar-image", leftSidebarImageType);
    },
    []
  );

  /* A function that is called when the layout mode is changed. */
  const onChangeLayoutMode = useCallback((mode: LayoutModeTypes) => {
    setLayoutModeType(mode);
    changeHTMLAttribute("data-layout-mode", mode);
    handleChangeLeftSidebarType(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* A function that is called when the menu items are changed. */
  const handleChangeMenuItems = useCallback((newMenuItems: MenuItem[]) => {
    setMenuItems(newMenuItems);
  }, []);

  /* A function that is called when the current open menu dropdown is changed. */
  const handleChangeCurrentOpenMenuDropdown = useCallback(
    (newCurrentOpenMenuDropdown: string) => {
      setCurrentOpenMenuDropdown((oldVersion) => {
        if (oldVersion === newCurrentOpenMenuDropdown) {
          return "";
        }
        return newCurrentOpenMenuDropdown;
      });
    },
    []
  );

  useEffect(() => {
    function loadUserDefaults() {
      const layout = localStorage.getItem("layout");
      let layoutTypeDefaults = layoutType;
      let preloaderDefaults = preloader;
      let layoutWidthTypeDefaults = layoutWidthType;
      let layoutPositionTypeDefaults = layoutPositionType;
      let topbarThemeTypeDefaults = topbarThemeType;
      let leftsidbarSizeTypeDefaults = leftsidbarSizeType;
      let leftSidebarViewTypeDefaults = leftSidebarViewType;
      let leftSidebarTypeDefaults = leftSidebarType;
      let leftSidebarImageTypeDefaults = leftSidebarImageType;
      let layoutModeTypeDefaults = layoutModeType;

      if (layout) {
        const layoutDefaults = JSON.parse(layout);
        layoutTypeDefaults = layoutDefaults.layoutType;
        preloaderDefaults = layoutDefaults.preloader;
        layoutWidthTypeDefaults = layoutDefaults.layoutWidthType;
        layoutPositionTypeDefaults = layoutDefaults.layoutPositionType;
        topbarThemeTypeDefaults = layoutDefaults.topbarThemeType;
        leftsidbarSizeTypeDefaults = layoutDefaults.leftsidbarSizeType;
        leftSidebarViewTypeDefaults = layoutDefaults.leftSidebarViewType;
        leftSidebarTypeDefaults = layoutDefaults.leftSidebarType;
        leftSidebarImageTypeDefaults = layoutDefaults.leftSidebarImageType;
        layoutModeTypeDefaults = layoutDefaults.layoutModeType;

        setLayoutType(layoutTypeDefaults);
        setPreloader(preloaderDefaults);
        setLayoutWidthType(layoutWidthTypeDefaults);
        setLayoutPositionType(layoutPositionTypeDefaults);
        setTopbarThemeType(topbarThemeTypeDefaults);
        setLeftsidbarSizeType(leftsidbarSizeTypeDefaults);
        setLeftSidebarViewType(leftSidebarViewTypeDefaults);
        setLeftSidebarType(leftSidebarTypeDefaults);
        setLeftSidebarImageType(leftSidebarImageTypeDefaults);
        setLayoutModeType(layoutModeTypeDefaults);
      }

      changeHTMLAttribute("data-layout", layoutTypeDefaults);
      changeHTMLAttribute("data-preloader", preloaderDefaults);
      changeHTMLAttribute("data-layout-width", layoutWidthTypeDefaults);
      changeHTMLAttribute("data-layout-position", layoutPositionTypeDefaults);
      changeHTMLAttribute("data-topbar", topbarThemeTypeDefaults);
      changeHTMLAttribute("data-sidebar-size", leftsidbarSizeTypeDefaults);
      changeHTMLAttribute("data-layout-style", leftSidebarViewTypeDefaults);
      changeHTMLAttribute("data-sidebar", leftSidebarTypeDefaults);
      changeHTMLAttribute("data-sidebar-image", leftSidebarImageTypeDefaults);
      changeHTMLAttribute("data-layout-mode", layoutModeTypeDefaults);
    }
    loadUserDefaults();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function handleSaveUserLayout() {
      const layout = JSON.stringify({
        layoutType,
        preloader,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        leftSidebarType,
        leftSidebarImageType,
        layoutModeType,
      });
      localStorage.setItem("layout", layout);
    }
    handleSaveUserLayout();
  }, [
    layoutModeType,
    layoutPositionType,
    layoutType,
    layoutWidthType,
    leftSidebarImageType,
    leftSidebarType,
    leftSidebarViewType,
    leftsidbarSizeType,
    preloader,
    topbarThemeType,
  ]);

  return (
    <LayoutDisclosure.Provider
      value={{
        // values
        layoutModeType,
        layoutType,
        preloader,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        leftSidebarType,
        leftSidebarImageType,
        menuItems,
        currentOpenMenuDropdown,

        // actions
        onChangeLayoutMode,
        onChangeLayoutType,
        handleChangePreloader,
        handleChangeLayoutWidthType,
        handleChangeLayoutPositionType,
        handleChangeTopbarThemeType,
        handleChangeLeftsidbarSizeType,
        handleChangeLeftSidebarViewType,
        handleChangeLeftSidebarType,
        handleChangeLeftSidebarImageType,
        handleChangeMenuItems,
        handleChangeCurrentOpenMenuDropdown,

        handleChangeLoading,
      }}
    >
      {children}

      {loading && <Loader loading={loading} />}
    </LayoutDisclosure.Provider>
  );
}
