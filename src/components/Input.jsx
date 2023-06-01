
import { useField } from "formik";



const CustomInput = ({ ...props }) => {
  
  const [field, meta] = useField(props);

  return (
    
      <>
        <input className="bg-gray-100 border-2 border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-5 focus:outline-none focus:bg-white focus:border-indigo-500" {...field} {...props} />
      <span>CPGE</span>
      {meta.touched && meta.error ? <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{meta.error}</p> : null}
      </>
    
  );
};

export default CustomInput;
