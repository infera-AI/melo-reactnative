import { Dimensions } from 'react-native';

const { width: deviceWidth } = Dimensions.get('window');
const scale = deviceWidth / 375;
 
export const normalize = (size: number) => Math.round(size * scale);
export { scale }; 