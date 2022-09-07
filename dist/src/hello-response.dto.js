"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloResponse = void 0;
const openapi = require("@nestjs/swagger");
class HelloResponse {
    static _OPENAPI_METADATA_FACTORY() {
        return { data: { required: true, type: () => String } };
    }
}
exports.HelloResponse = HelloResponse;
//# sourceMappingURL=hello-response.dto.js.map