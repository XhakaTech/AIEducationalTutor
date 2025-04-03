
/**
 * Converts kebab-case SVG attributes to camelCase for React
 * 
 * @param attributes Object containing SVG attributes
 * @returns Object with properly formatted React SVG attributes
 */
export function convertSvgAttributes(attributes: Record<string, any>): Record<string, any> {
  const reactAttributes: Record<string, any> = {};

  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'stroke-width') {
      reactAttributes.strokeWidth = value;
    } else if (key === 'stroke-linecap') {
      reactAttributes.strokeLinecap = value;
    } else if (key === 'stroke-linejoin') {
      reactAttributes.strokeLinejoin = value;
    } else if (key === 'fill-rule') {
      reactAttributes.fillRule = value;
    } else if (key === 'clip-rule') {
      reactAttributes.clipRule = value;
    } else if (key === 'stroke-miterlimit') {
      reactAttributes.strokeMiterlimit = value;
    } else {
      reactAttributes[key] = value;
    }
  }

  return reactAttributes;
}

/**
 * A function to safely parse SVG strings and convert them to React-friendly JSX
 * This doesn't actually render the SVG but helps document which attributes need conversion
 */
export function prepareSvgForReact(svgString: string): string {
  // In production, we would implement a full SVG parser here
  // For now, we'll just remind developers what needs to be changed manually
  
  // Common conversions:
  // stroke-width -> strokeWidth
  // stroke-linecap -> strokeLinecap
  // stroke-linejoin -> strokeLinejoin
  // fill-rule -> fillRule
  // clip-rule -> clipRule
  
  return svgString
    .replace(/stroke-width/g, 'strokeWidth')
    .replace(/stroke-linecap/g, 'strokeLinecap')
    .replace(/stroke-linejoin/g, 'strokeLinejoin')
    .replace(/fill-rule/g, 'fillRule')
    .replace(/clip-rule/g, 'clipRule');
}
