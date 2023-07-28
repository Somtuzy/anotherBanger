class BaseService {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        return await new this.model(data)
    }

    async updateOne(id, data) {
        return await this.model.findByIdAndUpdate({_id: id}, data, { new: true })
    }

    async deleteOne(id) {
        return await this.model.findByIdAndDelete({_id: id})
    }

    async findOne(filter) {
        return await this.model.findOne(filter)
    }

    async findAll(filter) {
        return await this.model.find(filter)
    }
}

module.exports = BaseService;