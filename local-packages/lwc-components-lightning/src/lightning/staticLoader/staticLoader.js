import ICONS from 'lightning/staticIcon';
import ICONS_RTL from 'lightning/staticIconRtl';

export function load(url) {
    if (url === 'lightning/auraDynamic') {
        return {
            createComponent: () => {},
        };
    }
    if (url === 'lightning/iconSvgTemplatesUtility') {
        return {
            default: ICONS.Utility,
        };
    }
    if (url === 'lightning/iconSvgTemplatesUtilityRtl') {
        return {
            default: ICONS_RTL.Utility,
        };
    }
    if (url === 'lightning/iconSvgTemplatesAction') {
        return {
            default: ICONS.Action,
        };
    }
    if (url === 'lightning/iconSvgTemplatesActionRtl') {
        return {
            default: ICONS_RTL.Action,
        };
    }
    if (url === 'lightning/iconSvgTemplatesStandard') {
        return {
            default: ICONS.Standard,
        };
    }
    if (url === 'lightning/iconSvgTemplatesStandardRtl') {
        return {
            default: ICONS_RTL.Standard,
        };
    }
    if (url === 'lightning/iconSvgTemplatesDoctype') {
        return {
            default: ICONS.Doctype,
        };
    }
    if (url === 'lightning/iconSvgTemplatesDoctypeRtl') {
        return {
            default: ICONS_RTL.Doctype,
        };
    }
    if (url === 'lightning/iconSvgTemplatesCustom') {
        return {
            default: ICONS.Custom,
        };
    }
    if (url === 'lightning/iconSvgTemplatesCustomRtl') {
        return {
            default: ICONS_RTL.Custom,
        };
    }
    return null;
}
