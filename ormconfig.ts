module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  autoLoadEntities: true,
  ssl:
    process.env.DISABLE_DATABASE_SSL === 'true'
      ? false
      : {
          rejectUnauthorized: false,
        },
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};
