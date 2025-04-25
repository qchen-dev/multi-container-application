import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

function Fib() {
  //   const [indexes, setIndexes] = useState([2, 3, 4]);
  const [indexes, setIndexes] = useState(['2', '3', '4']);
  const [values, setValues] = useState({});

  //   useEffect(() => {
  //     const fetchValues = async () => {
  //       const values = await axios.get('/api/values/current');
  //       setValues({ values: values.data });
  //     };

  //     const fetchIndexes = async () => {
  //       const indexes = await axios.get('/api/values/all');
  //       setIndexes({ indexes: indexes.data });
  //     };

  //     fetchValues();
  //     fetchIndexes();
  //   }, []);

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
    return indexes.join(', ');
  }

  function renderValues() {
    const entries = [];

    for (let key in values) {
      entries.push(
        <div key={key}>
          for index {key} I calculated {values[key]}
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

        {/* include validation with required or other standard HTML validation rules */}
        <input
          type='number'
          defaultValue=''
          {...register('index', { required: true })}
        />

        {/* errors will return when field validation fails  */}
        {errors.indexRequired && <span>This index field is required</span>}

        <input type='submit' />
      </form>

      <h3>Indexes I have seen:</h3>
      {renderIndexes()}

      <h3>Calculated Values:</h3>
      {renderValues()}
    </>
  );
}

export default Fib;
