/**
 * @typedef {Object} ImageObject
 * @property {number} [id] internal database id (may be empty before insertion)
 * @property {string} name name of the image
 * @property {Blob} imageBlob binary image blob
 * @property {Blob} imageThumbBlob binary image blob for a thumbnail image ()
 * @property {Array<Feature>} [features] the `features` property of the MATRE GeoJSON
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} Feature
 * @property {"Feature"} type
 * @property {FeatureGeometry} geometry
 * @property {FeatureProperty} properties
 */

/**
 * @typedef {Object} FeatureGeometry
 * @property {"Polygon"} type
 * @property {Array<Array<Array<number>>>} coordinates
 */

/**
 * @typedef {Object} FeatureProperty
 * @property {string} text
 * @property {number} score
 */

/** @typedef {Object} FeatureMatch
 * @property {string} key
 * @property {number} imageId
 * @property {string} imageName
 * @property {number} featureId
 * @property {string} text
 * @property {number} width
 * @property {number} height
 * @property {Promise<ImageBitmap>} croppedBitmap
 */
