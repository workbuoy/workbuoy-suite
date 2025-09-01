(function(){
  // Expose simple meta commands via console
  window.Meta = {
    scan: ()=>MetaSelf.scan().then(r=>(console.log('META scan',r), r)),
    map: ()=>MetaDocs.systemMap().then(r=>(console.log('SYSTEM_MAP',r), r)),
    propose: ()=>MetaGen.proposal(),
    learn: ()=>MetaLearn.summary()
  };
})();