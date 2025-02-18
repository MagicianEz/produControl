import { openDB } from "idb";

const dbName = "ProductControlDb";
const dbVersion = 1;

export const initDB = async () => {
    return await openDB(dbName, dbVersion, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("categories")) {
                db.createObjectStore("categories", { keyPath: "id_kategori" });
            }
            if (!db.objectStoreNames.contains("productions")) {
                db.createObjectStore("productions", {
                    keyPath: "production_id",
                });
            }
            if (!db.objectStoreNames.contains("stocks")) {
                db.createObjectStore("stocks", {
                    keyPath: "stock_id",
                });
            }
            if (!db.objectStoreNames.contains("delivery")) {
                db.createObjectStore("delivery", {
                    keyPath: "delivery_id",
                });
            }
            if (!db.objectStoreNames.contains("users")) {
                db.createObjectStore("users", {
                    keyPath: "user_id",
                });
            }
            if (!db.objectStoreNames.contains("logging")) {
                db.createObjectStore("logging", {
                    keyPath: "logging_id",
                });
            }
        },
    });
};

export const saveData = async (storeName: string, data: any) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    data.forEach((item: any) => store.put(item));
    await tx.done;

    setTimeout(async () => {
        const deleteTx = db.transaction(storeName, "readwrite");
        const deleteStore = deleteTx.objectStore(storeName);
        const keys = await deleteStore.getAllKeys();
        keys.forEach((key) => deleteStore.delete(key));
        await deleteTx.done;
        console.log(`Data di ${storeName} telah dihapus setelah 120 detik.`);
    }, 120 * 1000);
};

export const getData = async (storeName: string) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return await store.getAll();
};
