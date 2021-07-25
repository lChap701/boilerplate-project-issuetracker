const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Issue = require("../issue");
const crud = require("../crud");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  const PATH = "/api/issues/";

  /* My tests */
  suite("POST /api/issues/ Tests", () => {
    test("1)  All Fields Test", () => {
      const data = {
        issue_title: "Test 1",
        issue_text: "Testing all fields",
        created_by: "Lucas Chapman",
        assigned_to: "John Smith",
        status_text: "Closed",
        open: false,
      };

      chai
        .request(server)
        .post(PATH + "test")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            const json = JSON.parse(res.text);

            assert.isObject(json, "The returned data should be an object");
            assert.nestedInclude(
              json,
              data,
              `'${res.text}' should match '${JSON.stringify(data)}'`
            );
          }
        });
    });

    test("2)  Required Fields Only Test", () => {
      const data = {
        issue_title: "Test 2",
        issue_text: "Testing only required fields",
        created_by: "Lucas Chapman",
      };

      chai
        .request(server)
        .post(PATH + "testing")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            const json = JSON.parse(res.text);

            assert.isObject(json, "The returned data should be an object");

            assert.nestedInclude(
              json,
              data,
              `'${res.text}' should match '${JSON.stringify(data)}'`
            );

            assert.property(
              json,
              "created_on",
              "Missing 'created_on' property"
            );

            assert.isNumber(
              Date.parse(json.created_on),
              "'created_on' property should be a number"
            );

            assert.property(
              json,
              "updated_on",
              "Missing 'updated_on' property"
            );

            assert.isNumber(
              Date.parse(json.updated_on),
              "'updated_on' property should be a number"
            );

            assert.property(json, "open", "Missing 'open' property");

            assert.isBoolean(
              json.open,
              "'open' property should be a boolean value"
            );

            assert.isTrue(json.open, "'open' property should be 'true'");
            assert.property(json, "_id", "'_id' property is missing");
            assert.isNotEmpty(json._id, "'_id' should not be empty");

            assert.property(
              json,
              "status_text",
              "'status_text' property is missing"
            );

            assert.isEmpty(json.status_text, "'status_text' should be empty");
          }
        });
    });

    test("3)  Missing Data Test", () => {
      // Represents the data that will be sent during this test
      const data = {
        assigned_to: "Lucas Chapman",
        status_text: "Test 3",
        open: true,
      };

      chai
        .request(server)
        .post(PATH + "fail")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            const json = JSON.parse(res.text);

            assert.isObject(json);
            assert.property(json, "error");
            assert.equal(
              json.error,
              "required field(s) missing",
              `${json.error} does not equal 'required field(s) missing'`
            );
          }
        });
    });
  });

  suite("GET /api/issues/ Tests", () => {
    test("1)  View Issues Test", () => {
      chai
        .request(server)
        .get(PATH + "test")
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            const json = JSON.parse(res.text);

            assert.notEqual(json, [], "Returned nothing!");

            json.forEach((j) => {
              assert.property(
                j,
                "issue_title",
                "Missing 'issue_title' property"
              );

              assert.property(j, "issue_text", "Missing 'issue_text' property");
              assert.property(j, "created_by", "Missing 'created_by' property");

              assert.property(
                j,
                "assigned_to",
                "Missing 'assigned_to' property"
              );

              assert.property(
                j,
                "status_text",
                "Missing 'status_text' property"
              );

              assert.property(j, "open", "Missing 'open' property");
              assert.property(j, "created_on", "Missing 'created_on' property");
              assert.property(
                j,
                "updated_on",
                "Missing 'updated_on' property'"
              );

              assert.property(j, "_id", "Missing '_id' property");
            });
          }
        });
    });

    test("2)  One Filter Test", () => {
      chai
        .request(server)
        .get(PATH + "test?issue_title=Test 1")
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            const json = JSON.parse(res.text);

            assert.isArray(json, "Returned data should be an array");
            assert.isAtLeast(
              json.length,
              1,
              "At least 1 object should be returned"
            );
          }
        });
    });

    test("3)  Multiple Filters Test", () => {
      chai
        .request(server)
        .get(PATH + "test?issue_title=Test 1&open=false")
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            const json = JSON.parse(res.text);

            assert.isArray(json, "Returned data should be an array");
            assert.isAtLeast(
              json.length,
              1,
              "At least 1 object should be returned"
            );
          }
        });
    });
  });

  suite("PUT /api/issues/ Tests", () => {
    test("1)  One Field Test", () => {
      const exIssue = new Issue(
        "Test 3",
        "Testing updates on one field",
        "Lucas Chapman"
      );

      crud.getProject("test").then((project) => {
        const PROJECT = project._id;
        exIssue.project = PROJECT;

        crud.addIssue(exIssue).then((issue) => {
          const ID = issue._id;
          const data = {
            _id: ID,
            status_text: "Open",
          };

          project.issues.push(issue);
          project.save();

          chai
            .request(server)
            .put(PATH + "test")
            .send(data)
            .end((err, res) => {
              if (err) {
                console.log(err);
              } else {
                assert.deepPropertyVal(
                  JSON.parse(res.text),
                  "result",
                  "successfully updated",
                  `'${res.text}' should have a property of 'result' that is equal to 'successfully updated'`
                );
              }
            });
        });
      });
    });

    test("2)  Multiple Fields Test", () => {
      const exIssue = new Issue(
        "Test 4",
        "Testing updates on multiple fields",
        "Lucas Chapman"
      );

      crud.getProject("testing").then((project) => {
        const PROJECT = project._id;
        exIssue.project = PROJECT;

        crud.addIssue(exIssue).then((issue) => {
          const ID = issue._id;
          const data = {
            _id: ID,
            assigned_to: "John Smith",
            status_text: "Close",
            open: false,
          };

          project.issues.push(issue);
          project.save();

          chai
            .request(server)
            .put(PATH + "testing")
            .send(data)
            .end((err, res) => {
              if (err) {
                console.log(err);
              } else {
                assert.deepPropertyVal(
                  JSON.parse(res.text),
                  "result",
                  "successfully updated",
                  `'${res.text}' should have a property of 'result' that is equal to 'successfully updated'`
                );
              }
            });
        });
      });
    });

    test("3)  No Fields Test", () => {
      const exIssue = new Issue(
        "Test 5",
        "Testing updates with no fields",
        "Lucas Chapman"
      );

      crud.getProject("fail").then((project) => {
        const PROJECT = project._id;
        exIssue.project = PROJECT;

        crud.addIssue(exIssue).then((issue) => {
          const ID = issue._id;
          const data = { _id: ID };

          project.issues.push(issue);
          project.save();

          chai
            .request(server)
            .put(PATH + "fail")
            .send(data)
            .end((err, res) => {
              if (err) {
                console.log(err);
              } else {
                assert.deepPropertyVal(
                  JSON.parse(res.text),
                  "error",
                  "no update field(s) sent",
                  `'${res.text}' should have a property of 'error' that is equal to 'no update field(s) sent'`
                );
              }
            });
        });
      });
    });

    test("4)  No _id Test", () => {
      const data = new Issue(
        "Test 6",
        "Testing updates with no _id",
        "John Smith",
        "Closed",
        false
      );

      chai
        .request(server)
        .put(PATH + "fail")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            assert.deepPropertyVal(
              JSON.parse(res.text),
              "error",
              "missing _id",
              `'${res.text}' should have a property of 'error' that is equal to 'missing _id'`
            );
          }
        });
    });

    test("5)  Invalid _id Test", () => {
      const data = {
        _id: "7597e280d35ae174eeddf13c",
        issue_text: "Testing updates with an invalid _id",
        assigned_to: "John Smith",
        status_text: "Closed",
        open: false,
      };

      chai
        .request(server)
        .put(PATH + "fail")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            assert.deepPropertyVal(
              JSON.parse(res.text),
              "error",
              "could not update",
              `'${res.text}' should have a property of 'error' that is equal to 'could not update'`
            );
          }
        });
    });
  });

  // suite("DELETE /api/issues/ Tests", () => {
  //   test("1)  Delete Issue Test", () => {
  //     connection(async (client) => {
  //       const ID = await getId(client, "Test 1");

  //       chai
  //         .request(server)
  //         .delete(PATH + "test")
  //         .send({ _id: ID })
  //         .end((err, res) => {
  //           if (err) {
  //             console.log(err);
  //           } else {
  //             assert.deepPropertyVal(
  //               JSON.parse(res.text),
  //               "result",
  //               "successfully deleted",
  //               `'${res.text}' should have a property of 'result' that is equal to 'successfully deleted'`
  //             );
  //           }
  //         });
  //     });
  //   });

  //   test("2)  Invalid _id Test", () => {
  //     chai
  //       .request(server)
  //       .delete(PATH + "testing")
  //       .send({ _id: "7597e280d35ae174eeddf13c" })
  //       .end((err, res) => {
  //         if (err) {
  //           console.log(err);
  //         } else {
  //           assert.deepPropertyVal(
  //             JSON.parse(res.text),
  //             "error",
  //             "could not delete",
  //             `'${res.text}' should have a property of 'error' that is equal to 'could not delete'`
  //           );
  //         }
  //       });
  //   });

  //   test("3)  Missing _id Test", () => {
  //     chai
  //       .request(server)
  //       .delete(PATH + "testing")
  //       .send({})
  //       .end((err, res) => {
  //         if (err) {
  //           console.log(err);
  //         } else {
  //           assert.deepPropertyVal(
  //             JSON.parse(res.text),
  //             "error",
  //             "missing _id",
  //             `'${res.text}' should have a property of 'error' that is equal to 'missing _id'`
  //           );
  //         }
  //       });
  //   });
  // });
  // });
});
