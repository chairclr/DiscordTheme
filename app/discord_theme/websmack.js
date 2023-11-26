(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    autoApi: () => autoApi,
    autoraid: () => auto_default,
    createApi: () => api_default,
    createBatchFind: () => batchFind,
    parcelRequire: () => parcelRequire_default,
    webpackChunk: () => webpackChunk_default,
    webpackJsonp: () => webpackJsonp_default
  });

  // src/raid/webpackJsonp.js
  var llc = "__LOADABLE_LOADED_CHUNKS__";
  var webpackJsonp_default = (key) => {
    key ??= Object.keys(window).find((key2) => key2.includes("Jsonp"));
    key ??= window[llc] && llc;
    if (!window[key])
      return;
    const wjp = typeof window[key] === "function" ? window[key] : (...args) => window[key].push(args);
    let wpRequire;
    wjp(
      [Symbol()],
      {
        get: (_m, _, wpRq) => wpRequire = wpRq
      },
      [["get"]]
    );
    delete wpRequire.m.get;
    delete wpRequire.c.get;
    return [wpRequire.c, wpRequire];
  };

  // src/raid/webpackChunk.js
  var webpackChunk_default = (key) => {
    key ??= Object.keys(window).find((key2) => key2.startsWith("webpackChunk"));
    if (!window[key])
      return;
    let wpRequire;
    window[key].push([
      [Symbol()],
      {},
      (e) => {
        wpRequire = e;
      }
    ]);
    window[key].pop();
    return [wpRequire.c ?? // wow thats jank lmao
    Object.fromEntries(
      Object.entries(wpRequire.m).map(([k]) => [
        k,
        { id: k, loaded: true, exports: wpRequire(k) }
      ])
    ), wpRequire];
  };

  // src/raid/parcelRequire.js
  var parcelRequire_default = (key) => window[key ?? Object.keys(window).find((key2) => key2.startsWith("parcelRequire"))]?.cache;

  // src/raid/auto.js
  var auto_default = (key) => {
    const jsonp = webpackJsonp_default(key);
    if (jsonp?.[0])
      return ["jsonp", ...jsonp];
    const chunk = webpackChunk_default(key);
    if (chunk?.[0])
      return ["chunk", ...chunk];
    const parcel = parcelRequire_default(key);
    if (parcel)
      return ["parcel", parcel];
    throw new Error("No module fetching methods succeeded.");
  };

  // src/api/filters.js
  var byProps = (props) => (m) => props.every((p) => m[p] !== void 0);
  var byProtos = (protos) => (m) => m.prototype && protos.every((p) => m.prototype[p] !== void 0);
  var byDisplayName = (name, defaultExp = true) => (m) => (defaultExp ? m.displayName : m.default?.displayName) === name;
  var byKeyword = (strs) => (m) => strs.every(
    (s) => Object.keys(m).some((k) => k.toLowerCase().includes(s.toLowerCase()))
  );
  var byDispNameDeep = (name) => (m) => {
    const regex = new RegExp(`(${name}$)|((\\w+\\()+${name}\\))`);
    if (regex.test(m.displayName))
      return true;
    if (typeof m.$$typeof !== "symbol")
      return;
    if (m.Consumer !== void 0)
      return;
    if (m.type || m.render) {
      while (typeof m.type === "object" || typeof m.render === "object")
        m = m.type ?? m.render;
      if (regex.test(m.type?.displayName))
        return true;
      if (regex.test(m.render?.displayName))
        return true;
    }
  };
  var isKeyable = (m) => typeof m === "object" || typeof m === "function";
  var byNestedProps = (props) => (m) => isKeyable(m) && Object.values(m).some(
    (v) => isKeyable(v) && props.some((p) => v?.[p] !== void 0)
  );
  var allByCode = (modules, loaders) => (code) => Object.entries(loaders).filter(([, m]) => m.toString().match(code)).map(([id]) => modules[id]?.exports).filter((m) => m);

  // src/api/batch.js
  var batchFilter = (modules, filterList) => {
    const found = [];
    const checkModule = (mod) => filterList.forEach(([filter2, multi], i) => {
      if (multi && !found[i])
        found[i] = [];
      if (filter2(mod)) {
        if (multi)
          found[i].push(mod);
        else if (!found[i])
          found[i] = mod;
      }
    });
    for (const mid in modules) {
      const module = modules[mid].exports;
      if (!module || module === window)
        continue;
      if (module.default && module.__esModule)
        checkModule(module.default);
      checkModule(module);
    }
    return found;
  };
  var makeFakeWp = (filterList) => ({
    find: (f) => filterList.push([f, false]),
    findAll: (f) => filterList.push([f, true]),
    findByProps: (...p) => filterList.push([byProps(p), false]),
    findByPropsAll: (...p) => filterList.push([byProps(p), true]),
    findByPrototypes: (...p) => filterList.push([byProtos(p), false]),
    findByPrototypesAll: (...p) => filterList.push([byProtos(p), true]),
    findByNestedProps: (...p) => filterList.push([byNestedProps(p), false]),
    findByNestedPropsAll: (...p) => filterList.push([byNestedProps(p), true]),
    findByDisplayName: (n, d) => filterList.push([byDisplayName(n, d), false]),
    findByDisplayNameAll: (n, d) => filterList.push([byDisplayName(n, d), true]),
    findByDispNameDeep: (n) => filterList.push([byDispNameDeep(n), false]),
    findByDispNameDeepAll: (n) => filterList.push([byDispNameDeep(n), true]),
    findByKeyword: (...s) => filterList.push([byKeyword(s), false]),
    findByKeywordAll: (...s) => filterList.push([byKeyword(s), true])
  });
  var batch_default = (mods) => (cb) => {
    const fList = [];
    const fakeWp = makeFakeWp(fList);
    cb(fakeWp);
    return batchFilter(mods, fList);
  };

  // src/api/index.js
  var filter = (modules, single = true) => (filterFunc) => {
    const found = [];
    for (const mid in modules) {
      const module = modules[mid].exports;
      if (!module || module === window)
        continue;
      if (module.default && module.__esModule && filterFunc(module.default)) {
        if (single)
          return module.default;
        found.push(module.default);
      }
      if (filterFunc(module)) {
        if (single)
          return module;
        found.push(module);
      }
    }
    if (!single)
      return found;
  };
  var api_default = ([, modules, wpR]) => {
    const find = filter(modules);
    const findAll = filter(modules, false);
    const findByCodeAll = wpR ? allByCode(modules, wpR.m) : () => {
      throw new Error("findByCode does not work with this bundler");
    };
    return {
      batchFind: batch_default(modules),
      find,
      findAll,
      findByProps: (...p) => find(byProps(p)),
      findByPropsAll: (...p) => findAll(byProps(p)),
      findByPrototypes: (...p) => find(byProtos(p)),
      findByPrototypesAll: (...p) => findAll(byProtos(p)),
      findByNestedProps: (...p) => find(byNestedProps(p)),
      findByNestedPropsAll: (...p) => findAll(byNestedProps(p)),
      findByDisplayName: (d, p) => find(byDisplayName(d, p)),
      findByDisplayNameAll: (d, p) => findAll(byDisplayName(d, p)),
      findByDispNameDeep: (d) => find(byDispNameDeep(d)),
      findByDispNameDeepAll: (d) => findAll(byDispNameDeep(d)),
      findByKeyword: (...k) => find(byKeyword(k)),
      findByKeywordAll: (...k) => findAll(byKeyword(k)),
      findByCodeAll,
      findByCode: (c) => findByCodeAll(c)[0]
    };
  };
  var batchFind = ([, modules]) => batch_default(modules);

  // src/index.js
  var autoApi = () => api_default(auto_default());

  window.websmack = { ...src_exports };
})();
