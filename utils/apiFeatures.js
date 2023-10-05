class APIFeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        let queryObj = {...this.queryString};
        const excludedFields = ['sort', 'page','limit','fields'];
        excludedFields.forEach(element => {
           delete queryObj[element]
        });

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`);
        queryObj = JSON.parse(queryStr);
      
        this.query = this.query.find(queryObj);
        return this;
    };

    sort(){
         if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }else{
            // default sort
            this.query = this.query.sort('-cratedAt');
        }
        return this;
    };

    limitFields(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields)
        }else{
            this.query = this.query.select('-__v');
        }
        return this;
    };

    paginate(){
        let limit = this.queryString.limit || 100;
        let page = (this.queryString.page -1)*limit || 0
        this.query = this.query.limit(limit).skip(page)

       return this; 
    }

}

module.exports = APIFeatures;
