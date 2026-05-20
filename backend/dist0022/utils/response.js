export class ApiResponse {
    // Support both signatures:
    // ApiResponse.success(res, data, message?)
    // ApiResponse.success(res, message, data?)
    static success(res, a, b = undefined, statusCode = 200) {
        let data;
        let message;
        // If second arg is a string, treat as message: (res, message, data?)
        if (typeof a === 'string') {
            message = a;
            data = b;
        }
        else {
            // Otherwise treat as (res, data, message?)
            data = a;
            message = typeof b === 'string' ? b : 'Success';
        }
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }
    static error(res, message = 'Error', statusCode = 500, errors) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors
        });
    }
    static paginated(res, data, pagination, message = 'Success') {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination
        });
    }
}
