// Central place for locators and endpoints so steps never hard-code them.
module.exports = {
  pages: {
    home: {
      path: "/",
      elements: {
        heading: "h1",
        message: "#message",
      },
    },
  },
  endpoints: {
    message: "/api/message",
  },
};
