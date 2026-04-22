const ExpoKeepAwakeTag = 'ExpoKeepAwakeDefaultTag';

function useKeepAwake() {
  // Intentionally no-op.
}

function activateKeepAwake() {
  return Promise.resolve();
}

function activateKeepAwakeAsync() {
  return Promise.resolve();
}

function deactivateKeepAwake() {
  return Promise.resolve();
}

function isAvailableAsync() {
  return Promise.resolve(false);
}

function addListener() {
  return {
    remove() {},
  };
}

module.exports = {
  ExpoKeepAwakeTag,
  useKeepAwake,
  activateKeepAwake,
  activateKeepAwakeAsync,
  deactivateKeepAwake,
  isAvailableAsync,
  addListener,
};
