const Job = require("../models/Job");

const createJob = async (req, res) => {
  const job = req.body;
  try {
    await Job.create(job);
    return res.status(200).send("done");
  } catch (err) {
    console.log(err);
    return res.status(400).send("fail");
  }
};

const getAll = async (req, res) => {
  try {
    const job = await Job.find({})
      .populate("client")
      .populate("employee")
      .populate("profession")
      .populate("service");
    return res.status(200).json(job);
  } catch (err) {
    console.log(err);
    return res.status(400).send("fail");
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      await job.remove();
      return res.status(200).json({ message: "job deleted" });
    }
    return res.status(404).json({ message: "error deleting job!" });
  } catch (err) {
    console.log(err);
    return res.status(400).send("fail");
  }
};
module.exports = { createJob, getAll, deleteJob };
