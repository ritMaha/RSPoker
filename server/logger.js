import winston from 'winston';
const { combine, timestamp, printf, align, colorize } = winston.format;

const logger = winston.createLogger({
  format: combine(
    align(),
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf((info) => {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
