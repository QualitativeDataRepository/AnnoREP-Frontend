import React, { ChangeEvent, FC, FormEventHandler } from "react"

import { Login16 } from "@carbon/icons-react"
import { Button, Form, TextInput, Link } from "carbon-components-react"

import formStyles from "../../../styles/Form.module.css"

export interface LoginFormProps {
  /**The dataverse server url */
  dataverseServerUrl: string
  /**The dataverse api token */
  dataverseApiToken: string
  /**Is the dataverse api token valid? */
  dataverseApiTokenIsInvalid: boolean
  /**The error mesage for the dataverse api token input */
  dataverseApiTokenInvalidText: string
  /**Callback to handle the dataverse api token input changes */
  handleDataverseApiTokenChange(value: string): void
  /**The hypothesis api token */
  hypothesisApiToken: string
  /**Is the hypothesis api token valid? */
  hypothesisApiTokenIsInvalid: boolean
  /**The error message for the hypothesis api token input */
  hypothesisApiTokenInvalidText: string
  /**Callback to handle the hypothesis api token input changes */
  handleHypothesisApiTokenChange(value: string): void
  /**Callback to handle login */
  handleLogin(): void
}

/** Login Form */
const LoginForm: FC<LoginFormProps> = ({
  dataverseServerUrl,
  dataverseApiToken,
  dataverseApiTokenIsInvalid,
  dataverseApiTokenInvalidText,
  hypothesisApiToken,
  hypothesisApiTokenIsInvalid,
  hypothesisApiTokenInvalidText,
  handleDataverseApiTokenChange,
  handleHypothesisApiTokenChange,
  handleLogin,
}: LoginFormProps) => {
  const onDataverseApiTokenChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleDataverseApiTokenChange(event.target.value)
  const onHypothesisApiTokenChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleHypothesisApiTokenChange(event.target.value)
  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    handleLogin()
  }

  return (
    <div className={formStyles.container}>
      <Form onSubmit={onSubmit}>
        <h1 className={formStyles.title}>Login</h1>
        <p className={formStyles.desc}>
          Give AnnoREP permissions to access your <abbr>QDR</abbr> resources and write Hypothes.is
          annotations on your behalf by providing your Application Programming Interface (
          <abbr>API</abbr>) tokens. Don&apos;t have an <abbr>API</abbr> token? Use the links below
          to generate an <abbr>API</abbr> token.
        </p>
        <div className={formStyles.item}>
          <TextInput
            id="dataverse-api-token"
            name="dataverseApiToken"
            labelText={
              <div>
                <abbr>QDR</abbr> <abbr>API</abbr> token
              </div>
            }
            helperText={
              <div>
                Get your{" "}
                <Link
                  size="sm"
                  href={`${dataverseServerUrl}/dataverseuser.xhtml#dataverseUserForm:dataRelatedToMeView:apiTokenTab`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <abbr>QDR</abbr> <abbr>API</abbr> token
                  </span>
                </Link>
              </div>
            }
            invalid={dataverseApiTokenIsInvalid}
            invalidText={dataverseApiTokenInvalidText}
            required={true}
            aria-required={true}
            placeholder="Enter your QDR API token"
            size="xl"
            type="text"
            autoComplete="on"
            value={dataverseApiToken}
            onChange={onDataverseApiTokenChange}
          />
        </div>
        <div className={formStyles.item}>
          <TextInput
            id="hypothesis-api-token"
            name="hypothesisApiToken"
            labelText={
              <div>
                Hypothes.is <abbr>API</abbr> token
              </div>
            }
            helperText={
              <div>
                Get your{" "}
                <Link
                  size="sm"
                  href="https://hypothes.is/account/developer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    Hypothes.is <abbr>API</abbr> token
                  </span>
                </Link>
              </div>
            }
            invalid={hypothesisApiTokenIsInvalid}
            invalidText={hypothesisApiTokenInvalidText}
            required={true}
            aria-required={true}
            placeholder="Enter your Hypothes.is API token"
            size="xl"
            type="text"
            autoComplete="on"
            value={hypothesisApiToken}
            onChange={onHypothesisApiTokenChange}
          />
        </div>
        <Button className={formStyles.submitBtn} type="submit" renderIcon={Login16}>
          Login
        </Button>
      </Form>
    </div>
  )
}

export default LoginForm
