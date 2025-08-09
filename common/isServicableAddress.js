import zips from "../../../../.backyard/zips.js";
import {
    ZIP_PATTERN
} from "../contact/stores/contact.js";

export default function isServicableAddress($contact) {
    const {
        zip
    } = $contact.data;

    if (typeof zip !== "string") {
        return undefined;
    }

    if (ZIP_PATTERN.test(zip) !== true) {
        return undefined;
    }

    if (parseInt(zip) < 90001) {
        return false;
    }

    if (parseInt(zip) > 96162) {
        return false;
    }

    if (zips.network.includes(zip) === false) {
        return false;
    }

    return true;
}