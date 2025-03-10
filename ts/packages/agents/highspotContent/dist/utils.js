import axios from "axios";
export const translateAxiosError = (e, url) => {
    throw new Error(translateAxiosErrorNoThrow(e, url));
};
export const translateAxiosErrorNoThrow = (e, url) => {
    if (e instanceof axios.AxiosError) {
        const responseData = e.response?.data;
        const dataString = typeof responseData === "object"
            ? JSON.stringify(responseData)
            : responseData;
        return `${e.message}: ${url ? `${url} ` : ""}${dataString}`;
    }
    else {
        return e;
    }
};
//# sourceMappingURL=utils.js.map