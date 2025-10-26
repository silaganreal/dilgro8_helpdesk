import { ImgHTMLAttributes } from 'react';
import Logo from '../imgs/dilg-logo.png'

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img {...props} src={Logo} alt="DILG-LOGO" />
    );
}
