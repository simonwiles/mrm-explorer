import '$lib/types.js';
import Dexie, { liveQuery } from 'dexie';

export const db = new Dexie('mrmExplorer');
db.version(1).stores({
	images: '++id, name, imageData, features, width, height'
});

export const fetchAllImageObjects = async () => {
	return await db.table('images').toArray();
};

/**
 * Generates a live query for all image objects.
 *
 * @return  {import('dexie').Observable<Array<ImageObject & { id: number }>>} An Observable array of image objects.
 */
export const liveQueryAllImageObjects = () => {
	return liveQuery(() => db.table('images').toArray());
};

/**
 * @param {number} id
 */
export const fetchImageObjectById = async (id) => {
	try {
		return await db.table('images').get(id);
	} catch (error) {
		console.error(`Failed to get ID ${id}: ${error}`);
		return false;
	}
};

/**
 * insert or update an image in the database
 * @param {ImageObject} imageObject
 * @returns {Promise<[boolean, ImageObject | null]>}
 */
export const upsertImageObject = async (imageObject) => {
	try {
		if (imageObject.id) {
			await db.table('images').update(imageObject.id, imageObject);
			console.log(`Image ${imageObject.name} successfully updated.`);
			return [false, imageObject];
		}

		const id = await db.table('images').add(imageObject);
		console.log(`Image ${imageObject.name} successfully added. Got id ${imageObject.id}`);
		return [true, { id: /** @type {number} */ (id), ...imageObject }];
	} catch (error) {
		console.error(`Failed to upsert ${imageObject.name}: ${error}`);
		return [false, null];
	}
};

/**
 * Remove an image object from the database
 * @param {ImageObject & { id: number }} imageObject
 */
export const removeImageObject = async (imageObject) => {
	await db.table('images').delete(imageObject.id);
};

/**
 * Remove an image from the database by ID
 * @param {number} id
 */
export const removeImageObjectById = async (id) => {
	await db.table('images').delete(id);
};
