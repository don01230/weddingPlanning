db.plans.find().forEach( function (doc) {
  var tS1 = doc.updateTime;
    var tD1 = new Date(doc.updateTime);
    print(tD1);
    doc.updateTime = tD1;
    var tS2 = doc.planTime;
    var tD2 = new Date(doc.planTime);
    print(tD2);
    doc.planTime = tD2;
  db.plans.save(doc);
});

db.activities.find().forEach( function (doc) {
  var tS1 = doc.updateTime;
    var tD1 = new Date(doc.updateTime);
    print(tD1);
    doc.updateTime = tD1;
    var tS2 = doc.activityTime;
    var tD2 = new Date(doc.activityTime);
    print(tD2);
    doc.activityTime = tD2;
  db.activities.save(doc);
});

./mongoimport --jsonArray --db testproject --collection users --file user.json
./mongoimport --jsonArray --db testproject --collection plans --file Plan.json
./mongoimport --jsonArray --db testproject --collection activities --file activities.json
./mongoimport --jsonArray --db testproject --collection images --file images.json
./mongoimport --jsonArray --db testproject --collection comment --file comments.json
