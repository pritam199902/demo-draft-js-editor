import React from "react";

function useLocalStore() {
  function get(key) {
    const value = localStorage.getItem(key);
    return value;
  }
  function set(key, value) {
    localStorage.setItem(key, value);
  }
  return {
    get,
    set,
  };
}

export default useLocalStore;
