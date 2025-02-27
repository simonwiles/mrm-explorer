import '$lib/types.js';
import Dexie, { liveQuery } from 'dexie';

export const db = new Dexie('mrmExplorer');
db.version(1).stores({
	images: '++id, name'
});

/**
 * Count the number of image objects in the 'images' table
 * @return {Promise<number>} The count of image objects
 */
export const countImageObjects = async () => {
	return await db.table('images').count();
};

/**
 * Fetch all image objects from the database
 * @return {Promise<ImageObject[]>} An array of image objects
 */
export const fetchAllImageObjects = async () => {
	return await db.table('images').toArray();
};

/**
 * Return an observable array of image objects (conforming to the Svelte store contract)
 * @return  {import('dexie').Observable<Array<ImageObject & { id: number }>>} An Observable array of image objects
 */
export const liveQueryAllImageObjects = () => {
	return liveQuery(() => db.table('images').toArray());
};

/**
 * Fetch an image object from the database
 * @param {number} id
 * @return {Promise<ImageObject | null>}
 */
export const fetchImageObjectById = async (id) => {
	try {
		return await db.table('images').get(id);
	} catch (error) {
		console.error(`Failed to get ID ${id}: ${error}`);
		return null;
	}
};

/**
 * Insert or update an image in the database
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

		const id = /** @type {number} */ (await db.table('images').add(imageObject));
		console.log(`Image ${imageObject.name} successfully added. Got id ${id}`);
		return [true, { ...imageObject, id }];
	} catch (error) {
		console.error(`Failed to upsert ${imageObject.name}: ${error}`);
		return [false, null];
	}
};

/**
 * Remove an image object from the database
 * @param {ImageObject & { id: number }} imageObject
 * @returns {Promise<void>}
 */
export const removeImageObject = async (imageObject) => {
	await db.table('images').delete(imageObject.id);
};

/**
 * Remove an image object from the database by ID
 * @param {number} id
 * @returns {Promise<void>}
 */
export const removeImageObjectById = async (id) => {
	await db.table('images').delete(id);
};

/**
 * Remove all image objects from the database
 * @returns {Promise<void>}
 */
export const removeAllImageObjects = async () => {
	await db.table('images').clear();
};
