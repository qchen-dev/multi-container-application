import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

function Fib() {
  const [indexes, setIndexes] = useState([]); // Make it an array
  const [values, setValues] = useState({});

  useEffect(() => {
    const fetchValues = async () => {
      const values = await axios.get('/api/values/current');
      setValues(values.data); // Set the raw data
    };

    const fetchIndexes = async () => {
      const indexes = await axios.get('/api/values/all');
      setIndexes(indexes.data); // Set the raw data
    };

    fetchValues();
    fetchIndexes();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log(data);

    await axios.post('/api/values', data);
    reset();
  };

  console.log('watch on input change:', watch('index'));

  function renderIndexes() {
    return indexes.join(', '); // Simple way to display all indexes
  }

  function renderValues() {
    const entries = [];
    for (let key in values) {
      entries.push(
        <div key={key}>
          For index {key}, I calculated {values[key]}
        </div>
      );
    }
    return entries;
  }

  return (
    <>
      {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Enter your index:</label>

        {/* Include validation with required or other standard HTML validation rules */}
        <input
          type='number'
          defaultValue=''
          {...register('index', { required: true })}
        />

        {/* errors will return when field validation fails */}
        {errors.index && <span>This index field is required</span>}

        <input type='submit' />
      </form>

      <h3>Indexes I have seen:</h3>
      <div>{renderIndexes()}</div>

      <h3>Calculated Values:</h3>
      <div>{renderValues()}</div>
    </>
  );
}

export default Fib;
