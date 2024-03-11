import Dexie from 'dexie';

/**
 * @typedef {Object} ImageObject
 * @property {number} [id] internal database id
 * @property {string} name name of the image
 * @property {string | ArrayBuffer | null} imageData base64 encoded image
 * @property {Object<string,*>} [features]
 */

export const db = new Dexie('mrmExplorer');
db.version(1).stores({
	images: '++id, name, imageData, features'
});

export const fetchAllImageObjects = async () => {
	return await db.table('images').toArray();
};

/**
 * insert or update an image in the database
 * @param {ImageObject} imageObject
 */
export const upsertImageObject = async (imageObject) => {
	try {
		if (imageObject.id) {
			await db.table('images').update(imageObject.id, imageObject);
			console.log(`Image ${imageObject.name} successfully updated.`);
			return imageObject;
		}
		const id = await db.table('images').add(imageObject);
		console.log(`Image ${imageObject.name} successfully added. Got id ${imageObject.id}`);
		return { id, ...imageObject };
	} catch (error) {
		console.error(`Failed to upsert ${imageObject.name}: ${error}`);
	}
};

/**
 * Remove an image from the database
 * @param {ImageObject} imageObject
 */
export const removeImageObject = async (imageObject) => {
	if (!imageObject.id) return;
	await db.table('images').delete(imageObject.id);
};
