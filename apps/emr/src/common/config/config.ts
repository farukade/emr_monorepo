export const kafkaClientTemplate = (service: string, transport) => {
  return {
    name: `${service.toUpperCase()}_SERVICE`,
    transport,
    options: {
      client: {
        clientId: service.toLowerCase(),
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: `${service.toLocaleLowerCase()}-consumer`,
      },
    },
  };
}