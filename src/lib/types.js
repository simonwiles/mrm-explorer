/**
 * @typedef {Object} ImageObject
 * @property {number} [id] internal database id
 * @property {string} name name of the image
 * @property {Blob} imageBlob binary image blob
 * @property {Array<Feature>} [features] the `features` property of the MRM GeoJSON
 * @property {number} [width]
 * @property {number} [height]
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
 * @property {ImageObject} imageObject
 * @property {Feature} feature
 * @property {number} featureIdx
 */
