import Dexie from 'dexie';

export const db = new Dexie('mrmExplorer');
db.version(1).stores({
	images: '++id, name, image, mrm_json'
});
