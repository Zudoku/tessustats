FROM mhart/alpine-node:5

WORKDIR /
ADD ./ /tessustat
WORKDIR /tessustat/
RUN npm install

EXPOSE 3700

CMD ["node", "tools/server.js"]
