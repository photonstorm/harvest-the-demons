const constants = {
    styles: {
      text: {
        fontSize: 12,
        fontFamily: "Horror Sketch",
        align: "center",
        wordWrap: { width: 200, useAdvancedWrap: true },
      },
      colors: {
        white: (format) => {
          return format === "hex" ? "#ffffff" : 0xffffff;
        },
      },
    },
  };
  
  export default constants;
  