// This works on all devices/browsers, and uses IndexedDBShim as a final fallback
class IndexedDB {
  constructor() {
    this.indexedDB = window.indexedDB
      || window.mozIndexedDB
      || window.webkitIndexedDB
      || window.msIndexedDB
      || window.shimIndexedDB;
  }

  onupgradeneeded() {
    const db = this.open.result;

    if (!db.objectStoreNames.contains('cart')) {
      const store = db.createObjectStore('objectStore', {
        keyPath: 'id',
        autoIncrement: true
      });
      store.createIndex('CartIndex', 'cart');
    }
  }

  read(key) {
    const that = this;
    return new Promise((resolve, reject) => {
      try {
        that.open = that.indexedDB.open('database', 1);

        that.open.onupgradeneeded = that.onupgradeneeded.bind(that);

        that.open.onsuccess = () => {
          // Start a new transaction.

          const db = that.open.result;
          const tx = db.transaction('objectStore', 'readwrite');
          const store = tx.objectStore('objectStore');

          const read = store.get(key);

          read.onsuccess = () => {
            try {
              const res = JSON.parse(read.result[key]);
              resolve(res);
            } catch (e) {
              reject();
            }
          };

          read.onerror = () => {
            reject();
          };

          tx.oncomplete = () => {
            db.close();
          };
        };
      } catch (error) {
        reject();
      }
    });
  }

  purge(key) {
    const that = this;
    return new Promise((resolve, reject) => {
      try {
        that.open = that.indexedDB.open('database', 1);

        that.open.onupgradeneeded = that.onupgradeneeded.bind(that);

        that.open.onsuccess = () => {
          // Start a new transaction.

          const db = that.open.result;
          const tx = db.transaction('objectStore', 'readwrite');
          const store = tx.objectStore('objectStore');

          const purge = store.delete(key);

          purge.onsuccess = () => {
            resolve();
          };

          purge.onerror = () => {
            reject();
          };

          tx.oncomplete = () => {
            db.close();
          };
        };
      } catch (error) {
        reject();
      }
    });
  }

  write(key, value) {
    const that = this;
    return new Promise((resolve, reject) => {
      try {
        that.open = that.indexedDB.open('database', 1);

        that.open.onupgradeneeded = that.onupgradeneeded.bind(that);

        that.open.onsuccess = () => {
          // Start a new transaction.

          const db = that.open.result;
          const tx = db.transaction('objectStore', 'readwrite');
          const store = tx.objectStore('objectStore');

          const read = store.get(key);

          read.onsuccess = (e) => {
            const del = store.delete(key);

            del.onsuccess = (e) => {
              const write = store.put({ id: key, cart: value });

              write.onsuccess = (e) => {
                resolve();
              };

              write.onerror = (e) => {
                reject();
              };
            };
            del.onerror = (e) => {
              reject();
            };
          };

          read.onerror = (e) => {
            const write = store.put({ id: key, cart: value });

            write.onsuccess = (e) => {
              resolve();
            };

            write.onerror = (e) => {
              reject();
            };
          };

          tx.oncomplete = () => {
            db.close();
          };
        };
      } catch (error) {
        reject();
      }
    });
  }
}

const read = (key) => {
  const instance = new IndexedDB();
  return instance.read(key);
};

const write = (key, value) => {
  const instance = new IndexedDB();
  return instance.write(key, value);
};

const purge = (key) => {
  const instance = new IndexedDB();
  return instance.purge(key);
};

const Storage = {
  read,
  write,
  purge
};

export default Storage;
