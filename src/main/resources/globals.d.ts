declare const __non_webpack_require__: XpRequire;

declare const resolve: (page: string) => object;

interface XpLibraries {
  '/lib/mustache': {
    render: (view: object, config: Record<string, unknown>) => void;
  };
  '/lib/xp/portal': {
    serviceUrl: (config: {service: string}) => string;
  }
}
