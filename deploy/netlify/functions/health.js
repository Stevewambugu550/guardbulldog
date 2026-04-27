exports.handler = async function (event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'OK', message: 'GUARDBULLDOG API is running' }),
  };
};
