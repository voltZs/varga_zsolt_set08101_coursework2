var mongoose = require("mongoose");
var User = require("./models/user");
var Group = require("./models/group");
var Vent = require("./models/vent");
var VComment = require("./models/comment");

function seed(){
  // createUsers();
  // createGroups();
  // createVents();
}

function myDate(year, month, day, hour, minute){
  var d = new Date();

  d.setFullYear(year, month, day);
  d.setHours(hour);
  d.setMinutes(minute);

  return d
}

function createVents(){

  //VENT 1 IN PUBLIC GROUP
  Vent.create({
      date: myDate(2018, 3, 22, 18, 32),
      content: "This is the content of a vent... Blablablalba 1",
      category: 'rant',
      favourited: 2,
    },
    function(err, savedVent){
      if(err){
        console.log(err);
      } else {
        console.log("DB added vent:" + savedVent);
        Group.findOne({'name' : 'Public'}, function(err, foundGroup){
          if(err){
            console.log(err);
          } else {
            foundGroup.vents.push(savedVent); //pass in the whole object, only id is saved due tp the groupSchema validatpr
            foundGroup.save(function(err){
              if(err){
                console.log(err);
              }
            })
          }
        });
        User.findOne({'username' : 'volt_zs'}, function(err, foundUser){
          if(err){
            console.log(err);
          } else {
            foundUser.vents.push(savedVent);
            foundUser.save(function(err){
              if(err){
                console.log(err);
              }
            });
          }
        });

        User.findOne({username : "michaelrr32"}, function(err, foundCommenter){
          if(err){
            console.log(err);
          }else{
            VComment.create({
                date: myDate(2018, 3, 22, 18, 40),
                content: "LOL I'm sorry dude but this is hilarious",
                user: foundCommenter._id
              },
              function(err, savedComment){
                if(err){
                  console.log(err);
                } else {
                  savedVent.comments.push(savedComment._id);
                  savedVent.save(function(err){
                    if(err){
                      console.log(err);
                    }
                  });
                }
              }
            )
          }
        })
      }
    }
  );

  //VENT 2 IN PUBLIC GROUP
  Vent.create({
      date: myDate(2018, 3, 22, 14, 32),
      content: "This is the content of a vent... Blablablalba 2",
      category: 'confession',
      favourited: 2,
    },
    function(err, savedVent){
      if(err){
        console.log(err);
      } else {
        console.log("DB added vent:" + savedVent);
        Group.findOne({'name' : 'Public'}, function(err, foundGroup){
          if(err){
            console.log(err);
          } else {
            foundGroup.vents.push(savedVent); //pass in the whole object, only id is saved due tp the groupSchema validatpr
            foundGroup.save(function(err){
              if(err){
                console.log(err);
              }
            })
          }
        });
        User.findOne({'username' : 'wera-bera'}, function(err, foundUser){
          if(err){
            console.log(err);
          } else {
            foundUser.vents.push(savedVent);
            foundUser.save(function(err){
              if(err){
                console.log(err);
              }
            });
          }
        });

        //COMMENT
        User.findOne({username : "michaelrr32"}, function(err, foundCommenter){
          if(err){
            console.log(err);
          }else{
            VComment.create({
                date: myDate(2018, 3, 22, 18, 40),
                content: "Hahahaha from michael",
                user: foundCommenter._id
              },
              function(err, savedComment){
                if(err){
                  console.log(err);
                } else {
                  savedVent.comments.push(savedComment._id);
                  savedVent.save(function(err){
                    if(err){
                      console.log(err);
                    }
                  });
                  //ANOTHER COMMENT
                  User.findOne({username : "BenJammin"}, function(err, foundCommenter){
                    if(err){
                      console.log(err);
                    }else{
                      VComment.create({
                          date: myDate(2018, 3, 22, 18, 40),
                          content: "Hahahaha from ben",
                          user: foundCommenter._id
                        },
                        function(err, savedComment){
                          if(err){
                            console.log(err);
                          } else {
                            savedVent.comments.push(savedComment._id);
                            savedVent.save(function(err){
                              if(err){
                                console.log(err);
                              }
                            });
                          }
                        }
                      )
                    }
                  });
                }
              }
            )
          }
        });

      }
    }
  );

  //VENT 3 in PUBLIC GROUP
  Vent.create({
      date: myDate(2018, 3, 20, 19, 52),
      content: "This is the content of a vent... Blablablalba 3",
      category: 'ridiculous',
      favourited: 2,
    },
    function(err, savedVent){
      if(err){
        console.log(err);
      } else {
        console.log("DB added vent:" + savedVent);
        Group.findOne({'name' : 'Public'}, function(err, foundGroup){
          if(err){
            console.log(err);
          } else {
            foundGroup.vents.push(savedVent); //pass in the whole object, only id is saved due tp the groupSchema validatpr
            foundGroup.save(function(err){
              if(err){
                console.log(err);
              }
            })
          }
        });
        User.findOne({'username' : 'kayaya'}, function(err, foundUser){
          if(err){
            console.log(err);
          } else {
            foundUser.vents.push(savedVent);
            foundUser.save(function(err){
              if(err){
                console.log(err);
              }
            });
          }
        });

        //COMMENT
        User.findOne({username : "deadpool_n_stuff"}, function(err, foundCommenter){
          if(err){
            console.log(err);
          }else{
            VComment.create({
                date: myDate(2018, 3, 22, 18, 40),
                content: "Whaaat dp",
                user: foundCommenter._id
              },
              function(err, savedComment){
                if(err){
                  console.log(err);
                } else {
                  savedVent.comments.push(savedComment._id);
                  savedVent.save(function(err){
                    if(err){
                      console.log(err);
                    }
                  });

                  //ANOTHER COMMENT
                  User.findOne({username : "deadpool_n_stuff"}, function(err, foundCommenter){
                    if(err){
                      console.log(err);
                    }else{
                      VComment.create({
                          date: myDate(2018, 3, 22, 18, 45),
                          content: "Whaaat comment 2 dp",
                          user: foundCommenter._id
                        },
                        function(err, savedComment){
                          if(err){
                            console.log(err);
                          } else {
                            savedVent.comments.push(savedComment._id);
                            savedVent.save(function(err){
                              if(err){
                                console.log(err);
                              }
                            });

                            //THIRD COMMENT
                            User.findOne({username : "stan11"}, function(err, foundCommenter){
                              if(err){
                                console.log(err);
                              }else{
                                VComment.create({
                                    date: myDate(2018, 3, 22, 19, 49),
                                    content: "Whaaat stan",
                                    user: foundCommenter._id
                                  },
                                  function(err, savedComment){
                                    if(err){
                                      console.log(err);
                                    } else {
                                      savedVent.comments.push(savedComment._id);
                                      savedVent.save(function(err){
                                        if(err){
                                          console.log(err);
                                        }
                                      });
                                    }
                                  }
                                )
                              }
                            });
                          }
                        }
                      )
                    }
                  });
                }
              }
            )
          }
        });
      }
    }
  );
}

function createGroups(){
  Group.create({
      name : "Public",
      description: "In lacinia euismod rhoncus. Duis pulvinar bibendum enim a aliquam. Nullam auctor aliquet nunc. Pellentesque vitae erat purus. Sed in aliquet libero. Suspendisse varius, nunc volutpat bibendum cursus, nisi sapien tristique sapien, et vehicula odio libero sagittis nulla. Sed quis mi a erat dictum vehicula quis sed mauris."
    },
    function(err, savedGroup){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added group: " + savedGroup);
      }
    }
  );
  Group.create({
      name : "Bartenders United",
      description: "In lacinia euismod rhoncus. Duis pulvinar bibendum enim a aliquam. Nullam auctor aliquet nunc. Pellentesque vitae erat purus. Sed in aliquet libero. Suspendisse varius, nunc volutpat bibendum cursus, nisi sapien tristique sapien, et vehicula odio libero sagittis nulla. Sed quis mi a erat dictum vehicula quis sed mauris."
    },
    function(err, savedGroup){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added group: " + savedGroup);
      }
    }
  );
  Group.create({
      name : "Confessions only",
      description: "In lacinia euismod rhoncus. Duis pulvinar bibendum enim a aliquam. Nullam auctor aliquet nunc. Pellentesque vitae erat purus. Sed in aliquet libero. Suspendisse varius, nunc volutpat bibendum cursus, nisi sapien tristique sapien, et vehicula odio libero sagittis nulla. Sed quis mi a erat dictum vehicula quis sed mauris."
    },
    function(err, savedGroup){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added group: " + savedGroup);
      }
    }
  );
  Group.create({
      name : "Umm.. no?",
      description: "In lacinia euismod rhoncus. Duis pulvinar bibendum enim a aliquam. Nullam auctor aliquet nunc. Pellentesque vitae erat purus. Sed in aliquet libero. Suspendisse varius, nunc volutpat bibendum cursus, nisi sapien tristique sapien, et vehicula odio libero sagittis nulla. Sed quis mi a erat dictum vehicula quis sed mauris."
    },
    function(err, savedGroup){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added group: " + savedGroup);
      }
    }
  );
}

function createUsers(){
  User.create({
      username : "michaelrr32",
      email : "michael.r@mail.com"
    },
    function(err, savedUser){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added user: " + savedUser);
      }
    }
  );
  User.create({
      username : "adam55",
      email : "madaman990@mail.com"
    },
    function(err, savedUser){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added user: " + savedUser);
      }
    }
  );
  User.create({
      username : "volt_zs",
      email : "zsolt.varga@gmail.com"
    },
    function(err, savedUser){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added user: " + savedUser);
      }
    }
  );
  User.create({
      username : "deadpool_n_stuff",
      email : "sam.larson.s@hotmail.com"
    },
    function(err, savedUser){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added user: " + savedUser);
      }
    }
  );
  User.create({
      username : "kayaya",
      email : "colt.st@gmail.com"
    },
    function(err, savedUser){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added user: " + savedUser);
      }
    }
  );
  User.create({
      username : "stan11",
      email : "stanley.stan@yahoo.com"
    },
    function(err, savedUser){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added user: " + savedUser);
      }
    }
  );
  User.create({
      username : "wera-bera",
      email : "weronika.brownr@hotmail.com"
    },
    function(err, savedUser){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added user: " + savedUser);
      }
    }
  );
  User.create({
      username : "BenJammin",
      email : "ben4president@mail.com"
    },
    function(err, savedUser){
      if(err){
        console.console.log(err);
      } else {
        console.log("DB added user: " + savedUser);
      }
    }
  );
}


module.exports = seed;
