class APIFeatures{
  constructor(query,queryString) {
    this.query=query;
    this.queryString=queryString;
  }
  filter(){
    const queryObj= { ...this.queryString };
    const excludedFields=['page','sort','limit','fields'];

    excludedFields.forEach(el=>{
      delete queryObj[el];
    });
    // console.log(queryObj);
    /**2. ADVANCED FILTERING**/
      //{ difficulty: 'difficult', duration: { gte: '4' } }
    let queryStr=JSON.stringify(queryObj)
    queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)
    // console.log(JSON.parse(queryStr));
    //{ difficulty: 'difficult', duration: { '$gte': '4' } }

    this.query=this.query.find(JSON.parse(queryStr));
    return this;
    // let query=Tour.find(JSON.parse(queryStr));
  }
  sort(){
    if (this.queryString.sort){
      //Allow sorting by multiple parameters separated by comma
      const sortBy=this.queryString.sort.split(',').join(' ');
      console.log(sortBy);
      this.query=this.query.sort(sortBy );
      //sort('price duration')
    }else{
      this.query=this.query.sort({createdAt:-1});
    }
    return this;
  }
  limitFields(){
    if (this.queryString.fields){
      const fields=this.queryString.fields.split(',').join(' ');
      this.query=this.query.select(fields);
    }else{
      this.query=this.query.select('-__v');
    }
    return this;
  }
  paginate(){
    /**4. PAGINATION**/
      //page =2 && limit=10 1-10,page1, 11-20, page2,
    const page=this.queryString.page *1||1;//convert to number
    const limit=this.queryString.limit *1||100;
    const skip=(page-1)*limit;

    this.query=this.query.skip(skip).limit(limit)
    return this;
  }

}

module.exports=APIFeatures;