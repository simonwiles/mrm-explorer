/**
 * @typedef {Object} ImageObject
 * @property {number} [id] internal database id
 * @property {string} name name of the image
 * @property {string} imageData base64 encoded image
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