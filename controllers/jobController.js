const Job = require("../models/Job");
const mongoose = require("mongoose");

const createJob = async (req, res) => {
  const job = req.body;
  try {
    job.client = mongoose.Types.ObjectId(job.client);
    job.employee = mongoose.Types.ObjectId(job.employee);
    job.profession = mongoose.Types.ObjectId(job.profession);
    await Job.create(job);
    return res.status(200).send("done");
  } catch (err) {
    console.log(err);
    return res.status(400).send("fail");
  }
};

const getAll = async (req, res) => {
  const userId = req.query.userId;
  const totaljobs = await Job.countDocuments({});
  const jobsPerPage = 10;

  try {
    const page = parseInt(req.query.page || "0");
    if (userId) {
      const id = mongoose.Types.ObjectId(userId);
      const totaljobs = await Job.countDocuments({
        $or: [{ client: id }, { employee: id }],
      });
      // const jobsPerPage = 2 ;

      const jobs = await Job.find({
        $or: [{ client: id }, { employee: id }],
      })
        .populate("client")
        .populate("employee")
        .populate("profession")
        .limit(jobsPerPage)
        .skip(jobsPerPage * page);

      return res.status(200).json({
        totalPages: Math.ceil(totaljobs / jobsPerPage),
        jobs,
      });
    }

    const jobs = await Job.find({})
      .populate("client")
      .populate("employee")
      .populate("profession")
      .limit(jobsPerPage)
      .skip(jobsPerPage * page);
    return res.status(200).json({
      totalPages: Math.ceil(totaljobs / jobsPerPage),
      jobs,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send("fail");
  }
};

// const getJobById = async (req, res) => {
//     const id = req.params.id.toString();
//     try {
//         const job = await Job.findById(id).populate('client');
//         return res.status(200).send(job);
//     } catch (error) {
//         console.error(error);
//         return res.status(400).send("job not found");
//     }
// };

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

const updateStaredAt = async (req, res) => {
  const body = req.body;
  console.log(req.body);
  try {
    const job = await Job.findById(req.params.id);
    job.started_at = body.started_at;
    job.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

const updateEndedAt = async (req, res) => {
  const body = req.body;
  try {
    const job = await Job.findById(req.params.id);
    job.ended_at = body.ended_at;
    job.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

const updatePrice = async (req, res) => {
  const body = req.body;
  try {
    const job = await Job.findById(req.params.id);
    job.price = body.price;
    job.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

const updateDescription = async (req, res) => {
  const body = req.body;
  try {
    const job = await Job.findById(req.params.id);
    if (JSON.stringify(job.started_at) === "{}") {
      job.description = body.description;
      job.save();
      return res.json({ ok: true });
    }
    return res.status(500).json({ ok: false });
  } catch (err) {
    console.log(err);
  }
};

const updateReview = async (req, res) => {
  const body = req.body;
  console.log(req.body);
  try {
    const job = await Job.findById(req.params.id);
    if (JSON.stringify(job.ended_at) !== "{}") {
      job.review.rate = body.review.rate;
      job.review.comment = body.review.comment;
      job.save();
      return res.json(job);
    }
    return res.status(500).json({ ok: false });
  } catch (err) {
    console.log(err);
  }
};

// const deleteReview = async (req, res) => {
//     try {
//         const job = await Job.findById(req.params.id);
//         console.log(job.review)
//     } catch (err) {
//         console.log(err)
//     }
// }

module.exports = {
  createJob,
  getAll,
  deleteJob,
  updateStaredAt,
  updateEndedAt,
  updateDescription,
  updateReview,
  updatePrice,
  // getJobById
  // deleteReview
};
