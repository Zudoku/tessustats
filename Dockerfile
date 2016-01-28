FROM nodesource/jessie:5.0.0

WORKDIR /
ADD ./ /tessustat
WORKDIR /tessustat/
RUN npm install

EXPOSE 3700

CMD ["node", "tools/server.js"]