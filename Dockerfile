ARG  NODE_VERSION=16-alpine3.15

# STAGE 1
FROM node:${NODE_VERSION} As base

WORKDIR /usr/src/app

# install dependencies
COPY ["package.json", "yarn.lock", "./"]
RUN yarn --pure-lockfile

# STAGE 2
FROM node:${NODE_VERSION} as build

WORKDIR /usr/src/app

COPY --from=base /usr/src/app/node_modules ./node_modules

COPY . .

# build application
RUN yarn build

# STAGE 3
FROM node:${NODE_VERSION} as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# copy from build image
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules


# TODO: remove orm config and fix path
CMD [ "node", "dist/src/main" ]
