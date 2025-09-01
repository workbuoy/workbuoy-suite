window.MetaDocs=(function(){
  async function systemMap(){
    const map = {
      flow:"CXM → EventBus → FocusCard → Chat → (Core/Flex/Secure) → Kits/Meta",
      modules:["eventBus","cxm","focusCard","chat","modes","modules/flex","secure","kits","meta/*"]
    };
    localStorage.setItem('wb.SYSTEM_MAP', JSON.stringify(map,null,2));
    return map;
  }
  return {systemMap};
})();